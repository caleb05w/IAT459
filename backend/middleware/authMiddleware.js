//checks the wristband.
const jwt = require("jsonwebtoken")

//runs in between requests
//req = incoming request, res = response, net is a function that allows you to move on.
//next is needed for middleware to pass the user on, since this again, sits in between requests.
function verifyToken(req, res, next) {
  //get the full Authorization header e.g. "Bearer eyJ..."
  const authHeader = req.header("Authorization")

  //If there is no token, stop the code.
  //send a 401 message.
  if (!authHeader) return res.status(401).json({error: "Access denied"})

  //strip the "Bearer " prefix so jwt.verify gets just the token string
  //the frontend sends "Bearer <token>", but jwt.verify only wants "<token>"
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader

  try {
    //verify using jwt that the token is real. || verifies it against the secret key.
    //jwt.verify is a function that takes in token, and verifies it with a secret key tbh I dont really understand this 100% but I get the concept.
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallbackSecret",
    )

    //pulls the user id out of the decoded token, and adds it to the request
    //lets any route know who is making the request
    req.user = {id: decoded.id}

    //allows the user to keep going if everything checks out
    next()
  } catch (error) {
    //of course, catch and return any errors.
    res.status(401).json({error: "Invalid token"})
  }
}

module.exports = verifyToken
