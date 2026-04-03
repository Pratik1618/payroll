export const BASE_PATH = '/payroll-erp'

const ensureLeadingSlash = (value: string) =>
  value.startsWith('/') ? value : `/${value}`

export const withBasePath = (value: string) => {
  const normalizedValue = ensureLeadingSlash(value)

  if (normalizedValue === BASE_PATH || normalizedValue.startsWith(`${BASE_PATH}/`)) {
    return normalizedValue
  }

  return `${BASE_PATH}${normalizedValue}`
}

export const withoutBasePath = (pathname: string) => {
  if (pathname === BASE_PATH) {
    return '/'
  }

  if (pathname.startsWith(`${BASE_PATH}/`)) {
    return pathname.slice(BASE_PATH.length)
  }

  return pathname
}

export const getBackendUrl = (path: string) => {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.BASE_URL ??
    ''

  return `${baseUrl.replace(/\/$/, '')}${ensureLeadingSlash(path)}`
}
