let x: number = 30;
// x = "usaid";
// x = true;
x = 40;

let fname: string | null = null;

function add(x: number, y: number) {
  // if we see than we get that its a number
  x + y;
}

// add("Usaid",9); // if we try to assign the value of x string than it give error

let num = add(4, 8);
console.log(typeof num);

function createUser(user: { firstname: string; lastname?: string }) {
  console.log(user.firstname + " " + user.lastname);
}
createUser({ firstname: "Usaid" });

interface User {
  name: "";
  email?: "";
  password: "";
}
function UpdataUser(user: User) {
  user.email;
}
var paylod: User = {
  name: "",
  email: "",
  password: "",
};
