import devData from "../data/development-data/index";
import seed from "./seed";
import db from "../connection";

const runSeed = () => {
  return seed(devData).then(() => {
<<<<<<< HEAD
    return db.end();
=======
    db.end();
>>>>>>> 7c87b939ceb243107ba8e0770b86372745c483bc
  });
};

runSeed();
