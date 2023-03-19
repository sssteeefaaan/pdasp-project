import { Router } from "express";

const router = Router();

router.get("/:osoba", (req, res) => {
    try{
        const chars = req.params.osoba.split('');
        let osoba = chars[0].toUpperCase();
        if(chars.length > 1)
            osoba += chars.slice(1).join('').toLowerCase();
        console.log(req.hostname, osoba);
        return res.render("templates/main", {osoba});
    }catch(e)
    {
        console.error(e);
        return res.render("templates/main", {osoba: "Naughty, naughty"});
    }
});

export { router };