var x = 30;
// x = "usaid";
// x = true;
x = 40;
var fname = null;
function add(x, y) {
  // if we see than we get that its a number
  x + y;
}
// add("Usaid",9); // if we try to assign the value of x string than it give error
var num = add(4, 8);
console.log(typeof num);
function createUser(user) {
  console.log(user.firstname + " " + user.lastname);
}
createUser({ firstname: "Usaid" });
function UpdataUser(user) {
  user.email;
}
