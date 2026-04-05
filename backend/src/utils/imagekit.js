import ImageKit from "imagekit"
import { config } from "../config/env.config.js"

// SDK initialization
const imagekit = new ImageKit({
  privateKey: config.imagekit.privateKey,
  publicKey: config.imagekit.publicKey,
  urlEndpoint: config.imagekit.urlEndpoint,
})

export default imagekit
