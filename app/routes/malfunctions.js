const router = require("express").Router();
const {getContract} = require("../utils/ledgerUtils.js");

router.get("/create-new-malfunction", async(req, res) => {
    try{
        const malfunctionId = req.query["malfunctionId"];
        if(!malfunctionId)
            return res.status(400).send({message: "MalfunctionId is a mandatory field!"});

        const automobileId = req.query["automobileId"];
        if(!automobileId)
            return res.status(400).send({message: "AutomobileId is a mandatory field!"});

        let price;
        try{
            price = parseFloat(req.query["price"]);
            if(!price || price < 0 || isNaN(price))
                throw "";
        }catch(_){
            return res.status(400).send({message: "Price is a mandatory field that must be a positive real number!"});
        }

        const description = req.query["description"];
        if(!description)
        return res.status(400).send({message: "Description is a mandatory field!"});

        const contract = await getContract();
        const result = await contract.submitTransaction("CreateMalfunction", malfunctionId, description, automobileId, price);
        try{
            return res.send(JSON.parse(result));
        }catch(e){
            return res.send({ result })
        }
    }catch(e){
        console.error(`Error occurred: ${e}`);
        return res.send("Method invoke failed!");
    }
});

router.get("/fix-malfunction", async(req, res)=>{
    try{
        const malfunctionId = req.query["malfunctionId"];
        if(!malfunctionId)
            return res.status(400).send({message: "MalfunctionId is a mandatory field!"});

        const automobileId = req.query["automobileId"];
        if(!automobileId)
            return res.status(400).send({message: "AutomobileId is a mandatory field!"});

        const contract = await getContract();
        const result = await contract.submitTransaction("FixMalfunctions", automobileId, malfunctionId);
        try{
            return res.send(JSON.parse(result));
        }catch(e){
            return res.send({ result })
        }
    }catch(e){
        console.error(`Error occurred: ${e}`);
        return res.send("Method invoke failed!");
    }
});

router.get("/read-all-for", async(req, res)=>{
    try{
        const automobileId = req.query["automobileId"];
        if(!automobileId)
            return res.status(400).send({message: "AutomobileId is a mandatory field!"});

        const contract = await getContract();
        const result = await contract.submitTransaction("ReadAutomobile", automobileId);
        try{
            const automobile = JSON.parse(result);
            return res.send(automobile.currentMalfunctions);
        }catch(e){
            return res.send({ result })
        }
    }catch(e){
        console.error(`Error occurred: ${e}`);
        return res.send("Method invoke failed!");
    }
});

module.exports = router;