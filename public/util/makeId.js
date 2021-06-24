// Random ID Generation.
// Taken from https://medium.com/@weberzt/how-to-create-a-random-id-in-javascript-e92b39fedaef
export const makeId = () => {
  let ID = "";
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for ( var i = 0; i < 12; i++ ) {
    ID += characters.charAt(Math.floor(Math.random() * 36));
  }
  return ID;
}