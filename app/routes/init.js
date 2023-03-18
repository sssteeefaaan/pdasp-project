const router = require("express").Router();
const {getContract, prettyJSONString} = require("../utils/ledgerUtils.js");

router.get("/", async(req, res) => {
    try{
        const contract = await getContract();
        const result = await contract.submitTransaction("InitLedger", []);
        try{
            return res.send(prettyJSONString(result));
        }catch(e){
            return res.send({ result })
        }
    }catch(e){
        console.error(`Error occurred: ${e}`);
        return res.send("Method invoke failed!");
    }
});

module.exports = router;