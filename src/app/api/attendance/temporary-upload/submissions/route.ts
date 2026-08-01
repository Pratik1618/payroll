import { NextResponse } from 'next/server'
import { getBackendUrl } from '@/lib/base-path'
import http from 'http'
import https from 'https'
import zlib from 'zlib'

function fetchViaHttp(url: string, token: string): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url)
    const client = parsedUrl.protocol === 'https:' ? https : http

    const req = client.get(
      url,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          Connection: 'keep-alive',
        },
        timeout: 60000,
      },
      (res) => {
        const chunks: Buffer[] = []
        let statusCode = res.statusCode || 500
        let resolved = false

        const finish = () => {
          if (resolved) return
          resolved = true
          const buffer = Buffer.concat(chunks)
          const encoding = res.headers['content-encoding']
          let body = ''

          try {
            if (encoding === 'gzip') {
              body = zlib.gunzipSync(buffer).toString('utf-8')
            } else if (encoding === 'deflate') {
              body = zlib.inflateSync(buffer).toString('utf-8')
            } else {
              body = buffer.toString('utf-8')
            }
          } catch (err: any) {
            console.error('[submissions GET] Decompression failed, falling back to raw:', err?.message)
            body = buffer.toString('utf-8')
          }

          console.log('[submissions GET] Finished. Transfer length:', buffer.length, 'Uncompressed length:', body.length, 'status:', statusCode)
          resolve({ status: statusCode, body })
        }

        res.on('data', (chunk: Buffer) => chunks.push(chunk))
        res.on('end', finish)
        res.on('error', () => finish())
        res.on('close', () => setTimeout(finish, 100))
      }
    )

    req.on('error', (err) => reject(err))
    req.on('timeout', () => {
      req.destroy()
      reject(new Error('Request timed out'))
    })
  })
}

function repairJson(raw: string): any {
  try {
    return JSON.parse(raw)
  } catch (e) {
    let repaired = raw.trimEnd()
    if (repaired.endsWith(',')) repaired = repaired.slice(0, -1)
    const lastCompleteObj = repaired.lastIndexOf('}')
    if (lastCompleteObj > 0) repaired = repaired.substring(0, lastCompleteObj + 1)
    let braces = 0, brackets = 0
    for (const ch of repaired) {
      if (ch === '{') braces++
      else if (ch === '}') braces--
      else if (ch === '[') brackets++
      else if (ch === ']') brackets--
    }
    while (brackets > 0) { repaired += ']'; brackets-- }
    while (braces > 0) { repaired += '}'; braces-- }
    try {
      const result = JSON.parse(repaired)
      console.log('[submissions GET] Repaired truncated JSON successfully')
      return result
    } catch (e2) {
      throw new Error('Could not parse or repair JSON response')
    }
  }
}

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get('cookie') ?? ''
    const tokenMatch = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/)
    const token = tokenMatch?.[1]

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(req.url)
    const query = url.searchParams.toString()
    const backendPath = query
      ? `/api/attendance/temporary-upload/submissions?${query}`
      : '/api/attendance/temporary-upload/submissions'
    const backendUrl = getBackendUrl(backendPath)
    console.log('[submissions GET] Fetching:', backendUrl)

    const { status, body } = await fetchViaHttp(backendUrl, token)

    let data: any
    try {
      data = repairJson(body)
    } catch (e) {
      console.error('[submissions GET] JSON parse/repair failed. Last 100 chars:', body.substring(body.length - 100))
      return NextResponse.json({ message: 'Invalid response from backend' }, { status: 502 })
    }

    const recordCount = data?.results?.data?.length ?? data?.results?.total ?? 'unknown'
    console.log('[submissions GET] Success! Records:', recordCount)
    return NextResponse.json(data, { status })
  } catch (error: any) {
    console.error('[submissions GET] Error:', error?.message || error)

    return NextResponse.json(
      { message: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
