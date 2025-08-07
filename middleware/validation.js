const validateResource = (req,res,next) => {
    const {type, title} = req.body;
    if (!title || !type) {
    return res.status(400).json({error: `Missing required fields - "title" or "type".`});
    }
    next();
}

export {validateResource} ;