const router = require("express").Router();
const {getContract} = require("../utils/ledgerUtils.js");

router.get("/create-new-person", async(req, res) => {
    try{
        const personId = req.query["id"];
        if(!personId)
            return res.status(400).send({message: "Id is a mandatory field!"});

        const firstName = req.query["firstName"];
        if(!firstName)
            return res.status(400).send({message: "First Name is a mandatory field!"});

        const lastName = req.query["lastName"];
        if(!lastName)
            return res.status(400).send({message: "Last Name is a mandatory field!"});

        let assets;
        try{
            assets = parseFloat(req.query["assets"]);
            if(assets <= 0 || isNaN(assets))
            throw "";
        }catch(_){
            return res.status(400).send({message: "Assets is a mandatory field that must be a positive real number!"});
        }

        const contract = await getContract();
        const result = await contract.submitTransaction("CreatePerson", personId, firstName, lastName, assets);
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
        const result = await contract.submitTransaction("ReadAllPeople", []);
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
        let assets;
        try{
            assets = parseFloat(req.query["assets"]);
            if(assets <= 0 || isNaN(assets))
                throw "";
        }catch(_){
            return res.status(400).send({message: "Assets is a mandatory field that must be a positive real number!"});
        }

        console.log(assets);
        const query = {
            selector: {
                _id: {
                    "$regex": "person"
                },
                assets: {
                    "$gte": assets
                }
            }
        };

        const contract = await getContract();
        const result = await contract.submitTransaction("ReadPeopleQuery", JSON.stringify(query));
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
        const contract = await getContract();
        const result = await contract.submitTransaction("ReadPerson", req.params.id);
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