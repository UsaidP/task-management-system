import ImageKit from "imagekit";

// Validate that all required ImageKit environment variables are set.

var imagekit = new ImageKit({
	publicKey: "public_J5Hd7eCKkMA9wJj8Smj/TL0Srbk=",
	privateKey: "private_XJ/0D6KMN9mrDG18tEOPlkBQKb4=",
	urlEndpoint: "https://ik.imagekit.io/ptms",
});

// SDK initialization

export default imagekit;
