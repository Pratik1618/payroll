export function generateCertificate({
  employeeName,
  clientName,
  siteName,
}: {
  employeeName: string
  clientName: string
  siteName: string
}) {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const img = new Image()
  img.src = "/certificates/employee-of-month.jpg"

  img.onload = () => {
    canvas.width = img.width
    canvas.height = img.height

    ctx.drawImage(img, 0, 0)

    const centerX = canvas.width / 2

    ctx.textAlign = "center"
    ctx.fillStyle = "#1f3d2b"

    ctx.font = "bold 64px serif"
    ctx.fillText(employeeName, centerX, 467, canvas.width - 600)

    ctx.font = "32px serif"
    ctx.fillText(
      `Client: ${clientName}  |  Site: ${siteName}`,
      centerX,
      630
    )

    ctx.textAlign = "left"
    ctx.font = "26px serif"
    ctx.fillText(
      new Date().toLocaleDateString("en-IN"),
      300,
      900
    )

    const link = document.createElement("a")
    link.download = `${employeeName}-certificate.jpg`
    link.href = canvas.toDataURL("image/jpeg", 0.95)
    link.click()
  }
}
