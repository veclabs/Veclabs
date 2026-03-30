import { SolVec } from '../index'

describe('Hosted mode', () => {
  it('initializes in hosted mode when apiKey provided', () => {
    const sv = new SolVec({ apiKey: 'vl_live_test123' })
    expect((sv as any)._mode).toBe('hosted')
    expect((sv as any)._apiKey).toBe('vl_live_test123')
    expect((sv as any)._apiUrl).toBe('https://api.veclabs.xyz')
  })

  it('uses custom apiUrl when provided', () => {
    const sv = new SolVec({ apiKey: 'vl_live_test123', apiUrl: 'http://localhost:3000' })
    expect((sv as any)._apiUrl).toBe('http://localhost:3000')
  })

  it('initializes in self-hosted mode when no apiKey', () => {
    const sv = new SolVec({ network: 'devnet' })
    expect((sv as any)._mode).toBe('self-hosted')
  })

  it('collection() returns SolVecCollection with hostedConfig in hosted mode', () => {
    const sv = new SolVec({ apiKey: 'vl_live_test123' })
    const col = sv.collection('test', { dimensions: 4 })
    expect((col as any)._hostedConfig).toBeDefined()
    expect((col as any)._hostedConfig.apiKey).toBe('vl_live_test123')
  })

  it('collection() returns SolVecCollection without hostedConfig in self-hosted mode', () => {
    const sv = new SolVec({ network: 'devnet' })
    const col = sv.collection('test', { dimensions: 4 })
    expect((col as any)._hostedConfig).toBeUndefined()
  })
})
