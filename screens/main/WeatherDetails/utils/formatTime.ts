export const formatTime = (unix: number) => {
  const d = new Date(unix * 1000)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}