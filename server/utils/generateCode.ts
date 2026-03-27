export function generateInviteCode(length = 5): string {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  let result = ''

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * alphabet.length)
    result += alphabet[randomIndex]
  }

  return result
}
