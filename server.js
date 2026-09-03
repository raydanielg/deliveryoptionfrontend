import next from "next"
import { createServer } from "http"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dir = path.join(__dirname, "apps/web")
const app = next({ dev: false, dir })
const handle = app.getRequestHandler()

const port = process.env.PORT || 3000

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`> Next.js frontend ready on http://localhost:${port}`)
  })
})
