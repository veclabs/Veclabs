use anchor_lang::prelude::*;

declare_id!("8xjQ2XrdhR4JkGAdTEB7i34DBkbrLRkcgchKjN1Vn5nP");

#[program]
pub mod solvec {
    use super::*;

    /// Create a new vector collection.
    /// Called once per collection. Sets up the on-chain account.
    pub fn create_collection(
        ctx: Context<CreateCollection>,
        name: String,
        dimensions: u32,
        metric: u8,
    ) -> Result<()> {
        require!(name.len() <= 64, SolVecError::NameTooLong);
        require!(!name.is_empty(), SolVecError::NameEmpty);
        require!(
            dimensions > 0 && dimensions <= 4096,
            SolVecError::InvalidDimensions
        );
        require!(metric <= 2, SolVecError::InvalidMetric);

        let collection = &mut ctx.accounts.collection;
        let clock = Clock::get()?;

        collection.owner = ctx.accounts.owner.key();
        collection.name = name;
        collection.dimensions = dimensions;
        collection.metric = metric;
        collection.vector_count = 0;
        collection.merkle_root = [0u8; 32];
        collection.created_at = clock.unix_timestamp;
        collection.last_updated = clock.unix_timestamp;
        collection.is_frozen = false;
        collection.bump = ctx.bumps.collection;

        emit!(CollectionCreated {
            owner: collection.owner,
            name: collection.name.clone(),
            dimensions: collection.dimensions,
            created_at: collection.created_at,
        });

        msg!(
            "VecLabs: Collection '{}' created. Owner: {}. Dimensions: {}",
            collection.name,
            collection.owner,
            collection.dimensions
        );

        Ok(())
    }

    /// Update the Merkle root after vectors are upserted or deleted.
    /// Called by the SDK after every write operation.
    pub fn update_merkle_root(
        ctx: Context<UpdateMerkleRoot>,
        new_root: [u8; 32],
        new_vector_count: u64,
    ) -> Result<()> {
        let collection_key = ctx.accounts.collection.key();
        let collection = &mut ctx.accounts.collection;

        require!(!collection.is_frozen, SolVecError::CollectionFrozen);
        require!(
            collection.owner == ctx.accounts.authority.key(),
            SolVecError::Unauthorized
        );

        let old_root = collection.merkle_root;
        collection.merkle_root = new_root;
        collection.vector_count = new_vector_count;
        collection.last_updated = Clock::get()?.unix_timestamp;

        emit!(MerkleRootUpdated {
            collection: collection_key,
            old_root,
            new_root,
            vector_count: new_vector_count,
            updated_at: collection.last_updated,
        });

        msg!(
            "VecLabs: Merkle root updated. Collection: {}. Vectors: {}. Root: {}",
            collection_key,
            new_vector_count,
            hex::encode(new_root)
        );

        Ok(())
    }

    /// Grant read or read+write access to another wallet.
    pub fn grant_access(
        ctx: Context<GrantAccess>,
        grantee: Pubkey,
        access_level: u8,
    ) -> Result<()> {
        require!(
            ctx.accounts.collection.owner == ctx.accounts.owner.key(),
            SolVecError::Unauthorized
        );
        require!(access_level <= 1, SolVecError::InvalidAccessLevel);
        require!(
            grantee != ctx.accounts.owner.key(),
            SolVecError::CannotGrantToSelf
        );

        let access = &mut ctx.accounts.access_record;
        let clock = Clock::get()?;

        access.collection = ctx.accounts.collection.key();
        access.grantee = grantee;
        access.access_level = access_level;
        access.granted_at = clock.unix_timestamp;
        access.granted_by = ctx.accounts.owner.key();
        access.bump = ctx.bumps.access_record;

        emit!(AccessGranted {
            collection: access.collection,
            grantee,
            access_level,
            granted_by: access.granted_by,
        });

        msg!(
            "VecLabs: Access level {} granted to {} for collection {}",
            access_level,
            grantee,
            access.collection
        );

        Ok(())
    }

    /// Revoke access from a previously granted wallet.
    pub fn revoke_access(ctx: Context<RevokeAccess>, grantee: Pubkey) -> Result<()> {
        require!(
            ctx.accounts.collection.owner == ctx.accounts.owner.key(),
            SolVecError::Unauthorized
        );

        emit!(AccessRevoked {
            collection: ctx.accounts.collection.key(),
            grantee,
            revoked_by: ctx.accounts.owner.key(),
        });

        msg!(
            "VecLabs: Access revoked for {} on collection {}",
            grantee,
            ctx.accounts.collection.key()
        );

        Ok(())
    }

    /// Freeze a collection — prevents further writes.
    /// Used for archiving or compliance scenarios.
    pub fn freeze_collection(ctx: Context<FreezeCollection>) -> Result<()> {
        require!(
            ctx.accounts.collection.owner == ctx.accounts.owner.key(),
            SolVecError::Unauthorized
        );

        ctx.accounts.collection.is_frozen = true;

        msg!(
            "VecLabs: Collection {} frozen. Merkle root locked at {}",
            ctx.accounts.collection.key(),
            hex::encode(ctx.accounts.collection.merkle_root)
        );

        Ok(())
    }

    /// Get collection info (view function — no state change).
    pub fn get_collection_info(ctx: Context<GetCollectionInfo>) -> Result<()> {
        let c = &ctx.accounts.collection;
        msg!(
            "VecLabs Collection Info:\n  Name: {}\n  Owner: {}\n  Dimensions: {}\n  Vectors: {}\n  Root: {}\n  Frozen: {}\n  Created: {}\n  Updated: {}",
            c.name,
            c.owner,
            c.dimensions,
            c.vector_count,
            hex::encode(c.merkle_root),
            c.is_frozen,
            c.created_at,
            c.last_updated
        );
        Ok(())
    }
}

// ============================================================
// ACCOUNT STRUCTURES
// ============================================================

/// The main on-chain Collection account.
/// Space: 8 (discriminator) + 32 (owner) + 4+64 (name) + 4 (dim) +
///        1 (metric) + 8 (vector_count) + 32 (merkle_root) +
///        8 (created_at) + 8 (last_updated) + 1 (is_frozen) + 1 (bump)
#[account]
#[derive(Default)]
pub struct Collection {
    pub owner: Pubkey,
    pub name: String,
    pub dimensions: u32,
    pub metric: u8,
    pub vector_count: u64,
    pub merkle_root: [u8; 32],
    pub created_at: i64,
    pub last_updated: i64,
    pub is_frozen: bool,
    pub bump: u8,
}

impl Collection {
    pub const MAX_NAME_LEN: usize = 64;
    pub const SPACE: usize = 8 + 32 + (4 + Self::MAX_NAME_LEN) + 4 + 1 + 8 + 32 + 8 + 8 + 1 + 1;
}

/// Access control record — one per (collection, grantee) pair.
#[account]
pub struct AccessRecord {
    pub collection: Pubkey,
    pub grantee: Pubkey,
    pub access_level: u8, // 0 = read, 1 = read+write
    pub granted_at: i64,
    pub granted_by: Pubkey,
    pub bump: u8,
}

impl AccessRecord {
    pub const SPACE: usize = 8 + 32 + 32 + 1 + 8 + 32 + 1;
}

// ============================================================
// INSTRUCTION CONTEXTS
// ============================================================

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateCollection<'info> {
    #[account(
        init,
        payer = owner,
        space = Collection::SPACE,
        seeds = [
            b"collection",
            owner.key().as_ref(),
            name.as_bytes()
        ],
        bump
    )]
    pub collection: Account<'info, Collection>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateMerkleRoot<'info> {
    #[account(
        mut,
        seeds = [
            b"collection",
            collection.owner.as_ref(),
            collection.name.as_bytes()
        ],
        bump = collection.bump,
        constraint = collection.owner == authority.key() @ SolVecError::Unauthorized
    )]
    pub collection: Account<'info, Collection>,

    pub authority: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(grantee: Pubkey)]
pub struct GrantAccess<'info> {
    #[account(
        seeds = [
            b"collection",
            collection.owner.as_ref(),
            collection.name.as_bytes()
        ],
        bump = collection.bump,
        constraint = collection.owner == owner.key() @ SolVecError::Unauthorized
    )]
    pub collection: Account<'info, Collection>,

    #[account(
        init,
        payer = owner,
        space = AccessRecord::SPACE,
        seeds = [
            b"access",
            collection.key().as_ref(),
            grantee.as_ref()
        ],
        bump
    )]
    pub access_record: Account<'info, AccessRecord>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(grantee: Pubkey)]
pub struct RevokeAccess<'info> {
    #[account(
        seeds = [
            b"collection",
            collection.owner.as_ref(),
            collection.name.as_bytes()
        ],
        bump = collection.bump
    )]
    pub collection: Account<'info, Collection>,

    #[account(
        mut,
        close = owner,
        seeds = [
            b"access",
            collection.key().as_ref(),
            grantee.as_ref()
        ],
        bump = access_record.bump
    )]
    pub access_record: Account<'info, AccessRecord>,

    #[account(mut)]
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct FreezeCollection<'info> {
    #[account(
        mut,
        seeds = [
            b"collection",
            collection.owner.as_ref(),
            collection.name.as_bytes()
        ],
        bump = collection.bump
    )]
    pub collection: Account<'info, Collection>,

    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct GetCollectionInfo<'info> {
    pub collection: Account<'info, Collection>,
}

// ============================================================
// EVENTS
// ============================================================

#[event]
pub struct CollectionCreated {
    pub owner: Pubkey,
    pub name: String,
    pub dimensions: u32,
    pub created_at: i64,
}

#[event]
pub struct MerkleRootUpdated {
    pub collection: Pubkey,
    pub old_root: [u8; 32],
    pub new_root: [u8; 32],
    pub vector_count: u64,
    pub updated_at: i64,
}

#[event]
pub struct AccessGranted {
    pub collection: Pubkey,
    pub grantee: Pubkey,
    pub access_level: u8,
    pub granted_by: Pubkey,
}

#[event]
pub struct AccessRevoked {
    pub collection: Pubkey,
    pub grantee: Pubkey,
    pub revoked_by: Pubkey,
}

// ============================================================
// ERRORS
// ============================================================

#[error_code]
pub enum SolVecError {
    #[msg("You are not authorized to perform this action")]
    Unauthorized,

    #[msg("Collection name cannot be empty")]
    NameEmpty,

    #[msg("Collection name too long — maximum 64 characters")]
    NameTooLong,

    #[msg("Invalid dimensions — must be between 1 and 4096")]
    InvalidDimensions,

    #[msg("Invalid metric — must be 0 (cosine), 1 (euclidean), or 2 (dot product)")]
    InvalidMetric,

    #[msg("Invalid access level — must be 0 (read) or 1 (read+write)")]
    InvalidAccessLevel,

    #[msg("Cannot grant access to yourself")]
    CannotGrantToSelf,

    #[msg("Collection is frozen — no further writes are permitted")]
    CollectionFrozen,
}
