import { Router } from "express";

import { getContract } from "../utils/ledgerUtils";

const router = Router();

router.post("/create-new-person", async(req, res) => {
    try{
        let id : string;
        let firstName : string;
        let lastName : string;
        let email : string;
        let assets : string;

        try{
            id = req.body["id"] as string;
            if(id.length < 1)
                throw "";
        }catch(_){
            return res.status(400).send({message: "Id is a mandatory field!"});
        }

        try{
            firstName = req.body["firstName"] as string;
            if(firstName.length < 1)
                throw "";
        }catch(_){
            return res.status(400).send({message: "FirstName is a mandatory field!"});
        }

        try{
            lastName = req.body["lastName"] as string;
            if(lastName.length < 1)
                throw "";
        }catch(_){
            return res.status(400).send({message: "LastName is a mandatory field!"});
        }

        try{
            email = req.body["email"] as string;
            if(email.length < 1)
                throw "";
        }catch(_){
            return res.status(400).send({message: "Email is a mandatory field!"});
        }

        try{
            assets = req.body["assets"] as string;
            const assetsFloat = parseFloat(assets);
            if(isNaN(assetsFloat) || assetsFloat < 0)
                throw "";
        }catch(_){
            return res.status(400).send({message: "Assets is a mandatory field that must be a positive real number!"});
        }

        const contract = await getContract();
        const result = await contract.submitTransaction("CreatePerson", id, firstName, lastName, email, assets);
        try{
            return res.send(JSON.parse(result.toString()));
        }catch(e){
            return res.send({ result: result.toString() })
        }
    }catch(e){
        console.error(`Error occurred: ${e}`);
        return res.send("Method invoke failed!");
    }
});

router.get("/read-all", async(_, res) => {
    try{
        const contract = await getContract();
        const result = await contract.submitTransaction("ReadAllPeople");
        try{
            return res.send(JSON.parse(result.toString()));
        }catch(e){
            return res.send({ result: result.toString() })
        }
    }catch(e){
        console.error(`Error occurred: ${e}`);
        return res.send("Method invoke failed!");
    }
});

router.get("/read-filtered/:assets", async(req, res) => {
    try{
        let assets : string;
        try{
            assets = req.params.assets as string;
            const assetsFloat = parseFloat(assets);
            if(isNaN(assetsFloat) || assetsFloat < 0)
                throw "";
        }catch(_){
            return res.status(400).send({message: "Assets is a mandatory field that must be a positive real number!"});
        }

        const query = {
            selector: {
                _id: {
                    "$regex": "^person:"
                },
                assets: {
                    "$gte": parseFloat(assets)
                }
            }
        };

        const contract = await getContract();
        const result = await contract.submitTransaction("ReadPeopleQuery", JSON.stringify(query));
        try{
            return res.send(JSON.parse(result.toString()));
        }catch(e){
            return res.send({ result: result.toString() })
        }
    }catch(e){
        console.error(`Error occurred: ${e}`);
        return res.send("Method invoke failed!");
    }
});

router.get("/:id", async(req, res) => {
    try{
        let id : string;
        try{
            id = req.params.id as string;
            if(id.length < 1)
                throw "";
        }catch(_){
            return res.status(400).send({message: "Id is a mandatory field!"});
        }

        const contract = await getContract();
        const result = await contract.submitTransaction("ReadPerson", id);
        try{
            return res.send(JSON.parse(result.toString()));
        }catch(e){
            return res.send({ result: result.toString() })
        }
    }catch(e){
        console.error(`Error occurred: ${e}`);
        return res.send("Method invoke failed!");
    }
});

export { router };