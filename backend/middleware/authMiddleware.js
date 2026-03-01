//checks the wristband.
const jwt = require("jsonwebtoken");

//runs in between requests
//req = incoming request, res = response, net is a function that allows you to move on.
//next is needed for middleware to pass the user on, since this again, sits in between requests.
function verifyToken(req, res, next) {
  //create token, get it from "Authorization field" // idk what this field comes from.
  const token = req.header("Authorization");

  //If there is no token, stop the code.
  //send a 401 message.
  if (!token) return res.status(401).json({ error: "Access denied" });

  try {
    //verify using jwt that the token is real. || verifies it against the secret key.
    //jwt.verify is a function that takes in token, and verifies it with a secret key tbh I dont really understand this 100% but I get the concept.
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallbackSecret",
    );

    //pulls the user id out of the decoded token, and adds it ot the request
    //lets any route know who is making the request
    req.userId = decoded.id; // add user ID to request

    //allows the user to keep going if everything checks out
    next();
  }
  //of course, catch and return any errors.
  catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = verifyToken;
