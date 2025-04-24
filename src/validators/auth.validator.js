import { body } from "express-validator";

const userRegistrationValidator = () => {
  // we want to execute it directly
  // thats why we have't use any next()

  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid Email"),

    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLength({ min: 3 })
      .withMessage("Username should be minimum of 3 character")
      .isLength({ max: 13 })
      .withMessage("Username should be maximum of 13 character"),

    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 3 })
      .withMessage("Password should be minimum of 3 character")
      .isLength({ max: 13 })
      .withMessage("Password should be maximum of 13 character"),
    body("role")
      .notEmpty()
      .withMessage("Role is required")
      .isIn(["admin", "user", "moderator"])
      .withMessage("Invalid role"),
  ];
};

const userLoginValidator = () => {
  return [
    body("email").isEmail().withMessage("Email is not valid"),
    body("password").notEmpty().withMessage("Password cannot be empty"),
  ];
};
export { userRegistrationValidator, userLoginValidator };
