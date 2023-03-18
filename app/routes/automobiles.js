const router = require("express").Router();
const {getContract} = require("../utils/ledgerUtils.js");

router.get("/create-new-automobile", async(req, res) => {
    try{
        const automobileId = req.query["id"];
        if(!automobileId)
            return res.status(400).send({message: "Id is a mandatory field!"});

        let price;
        try{
            price = parseFloat(req.query["price"]);
            if(!price || price <= 0 || isNaN(price))
                throw "";
        }catch(_){
            return res.status(400).send({message: "Price is a mandatory field that must be a positive real number!"});
        }

        const ownerId = req.query["ownerId"];
        if(!ownerId)
        return res.status(400).send({message: "OwnerId is a mandatory field!"});

        const brand = req.query["brand"];
        if(!brand)
            return res.status(400).send({message: "Brand is a mandatory field!"});

        const model = req.query["model"];
        if(!model)
            return res.status(400).send({message: "Model is a mandatory field!"});

        const color = req.query["color"];
        if(!color)
            return res.status(400).send({message: "Color is a mandatory field!"});

        let year;
        try{
            year = parseInt(req.query["year"]);
            if(!year || year <= 0 || isNaN(year))
                throw "";
        }catch(message){
            return res.status(400).send({message: "Year is a mandatory field that must be a positive whole number!"});
        }

        const contract = await getContract();
        const result = await contract.submitTransaction("CreateAutomobile", automobileId, brand, model, color, year, price, ownerId);
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

router.get("/change-color", async(req, res) => {
    try{
        const automobileId = req.query["automobileId"];
        if(!automobileId)
            return res.status(400).send({message: "AutomobileId is a mandatory field!"});

        const color = req.query["color"];
        if(!color)
            return res.status(400).send({message: "Color is a mandatory field!"});

        const contract = await getContract();
        const result = await contract.submitTransaction("ColorAutomobile", automobileId, color);
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

router.get("/change-ownership", async(req, res) => {
    try{
        const automobileId = req.query["automobileId"];
        if(!automobileId)
            return res.status(400).send({message: "AutomobileId is a mandatory field!"});

        const newOwnerId = req.query["newOwnerId"];
        if(!newOwnerId)
            return res.status(400).send({message: "NewOwnerId is a mandatory field!"});

        const changeWithMalfunctions = req.query["changeWithMalfunctions"];
        if(!changeWithMalfunctions)
            return res.status(400).send({message: "ChangeWithMalfunctions is a mandatory field!"});

        const contract = await getContract();
        const result = await contract.submitTransaction("ChangeOwnership", automobileId, newOwnerId, changeWithMalfunctions);
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

router.get("/read-all", async(req, res) => {
    try{
        const contract = await getContract();
        const result = await contract.submitTransaction("ReadAllAutomobiles", []);
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

router.get("/read-my-garage", async(req, res) => {
    try{
        const ownerId = req.query["ownerId"];
        if(!ownerId)
            return res.status(400).send({message: "OwnerId is a mandatory field!"});

        const query = { selector: { _id: { "$regex": "automobile" }, ownerId } };
        const contract = await getContract();
        const result = await contract.submitTransaction("ReadAutomobilesQuery", JSON.stringify(query));
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

router.get("/read-filtered", async(req, res) => {
    try{
        const ownerId = req.query["ownerId"];
        if(!ownerId)
            return res.status(400).send({message: "OwnerId is a mandatory field!"});

        const color = req.query["color"];
        if(!color)
            return res.status(400).send({message: "Color is a mandatory field!"});

        const query = { selector: { _id: { "$regex": "automobile" }, color, ownerId } };
        const contract = await getContract();
        const result = await contract.submitTransaction("ReadAutomobilesQuery", JSON.stringify(query));
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

router.get("/:id", async(req, res) => {
    try{
        const automobileId = req.params.id;
        if(!automobileId)
            return res.status(400).send({message: "AutomobileId is a mandatory field!"});

        const contract = await getContract();
        const result = await contract.submitTransaction("ReadAutomobile", automobileId);
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

module.exports = router;