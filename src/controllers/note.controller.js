const createNote = async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: "Title and content are required" });
  }

  try {
    const note = new Note({
      title,
      content,
      user: req.user._id, // Assuming req.user is set by authentication middleware
    });

    await note.save();
    return res.status(201).json({ message: "Note created successfully", note });
  } catch (error) {
    return res.status(500).json({ message: "Error creating note", error });
  }
};
