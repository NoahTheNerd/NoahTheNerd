const fs = require('fs')
const nodecanvas = require('canvas')
const axios = require('axios')

nodecanvas.registerFont('./assets/rankcard/Lato-Regular.ttf', { family: 'rcReg' })
nodecanvas.registerFont('./assets/rankcard/Lato-Black.ttf', { family: 'rcBig' })

const canvas = nodecanvas.createCanvas(800, 300)
const ctx = canvas.getContext('2d')

const img = new nodecanvas.Image

let cardData;
let spCardData = []
fs.readFile('/home/ixnoah/api/assets/rankcard/card.png', (err, data) => {if (err) throw err;cardData = data;})

async function loadCustomImage(context, imageURL){

    const imageLogo = await nodecanvas.loadImage(imageURL);
    await context.drawImage(imageLogo, 0, 0, imageLogo.width, imageLogo.height);
 
 }

module.exports = [
    {
        endpoint: '/polaris/:serverid/:userid',
        run: async (req, res) => {
            res.set('Cache-Control', 'no-cache');
            var gtfo = false; // dumb express fuckery makes me have to do this
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let { data } = await axios.get(`https://gdcolon.com/polaris/api/leaderboard/${req.params['serverid']}?user=${req.params['userid']}`).catch(err => {
                gtfo = true
		let d = new Date();
		console.log(`[${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}] [\x1b[31mERROR\x1b[0m] ${err.response.data.message}`)
                return res.send(err.response.data)
            })
            if (gtfo) return
            if (data.leaderboard.length>1 | data.leaderboard[0]==undefined) return res.sendStatus(400)
            if (data.message) return res.send({error:true,message:message})

            const xp = data.leaderboard[0].xp;
            const lvl = await getLevel(xp, data.settings)

            data.leaderboard[0].avatar = data.leaderboard[0].avatar.replace('webp','png')
            const pfp = await nodecanvas.loadImage(data.leaderboard[0].avatar)

            img.src = cardData;
            ctx.fillStyle = req.query.custombg ? '#'+req.query.custombg : "#092b1e"
            ctx.fillRect(273, 169, 384, 48)
            ctx.fillStyle = req.query.customfg ? '#'+req.query.customfg : "#29946b"
            ctx.fillRect(273, 169, percentage(xp-xpForLevel(lvl, data.settings), getLevel(xp, data.settings, true).xpRequired-xpForLevel(lvl, data.settings)), 48)
            ctx.fillStyle = '#ffffff'
            ctx.drawImage(pfp, 79, 78, 145, 145)
            await ctx.drawImage(img, 0, 0, img.width, img.height) // Layering it on top makes it so we don't have to do a bunch of annoying equations, thank you whoever invented layers :pray:
            if (req.query.customimg) {
                await loadCustomImage(ctx, req.query.customimg)
            }

            ctx.font = '52px rcBig'
            ctx.fillStyle = '#cccccc'
            ctx.fillText(data.leaderboard[0].username, 273, 115, 300)
            ctx.font = '24px rcReg'
            ctx.fillStyle = '#ffffff'
            ctx.fillText(`Level: ${commafy(lvl)} • XP: ${commafy(data.leaderboard[0].xp)}/${commafy(getLevel(xp, data.settings, true).xpRequired)}`, 273, 148, 300)
            ctx.fillStyle = '#ff0000'
            ctx.font = '24px rcReg'
            ctx.fillText(`Hi Rank Card user, this system is being replaced!\nRead about the new system at dev.ixnoah.live!`, 5, 20, 800)
            // It's like 22:00 and i have no clue what the fuck i'm doing. My throat is sore and i want to perish.
            // it's 10:22, months later and i'm at school what the fuck who coded this
            // i coded this
            res.setHeader('Content-Type', 'image/png')
            canvas.pngStream().pipe(res)
        }   
    },
    {
        endpoint: '/polaris/',
        run: (req, res) => {
            res.sendStatus(400)
        }   
    },
    {
        endpoint: '/polaris/:server',
        run: (req, res) => {
            res.sendStatus(400)
        }   
    }
]


function percentage(partialValue, totalValue) {
    return Math.floor((384 * partialValue) / totalValue);
} 

function xpForLevel(lvl, settings) {
    if (lvl > settings['maxLevel']) lvl = settings['maxLevel']
    let xpRequired = Object.entries(settings.curve).reduce((total, n) => total + (n[1] * (lvl ** n[0])), 0)
    return settings.rounding > 1 ? settings.rounding * Math.round(xpRequired / settings.rounding) : xpRequired
}
function getLevel(xp, settings, returnReq) {
    let lvl = 0
    let previousLevel = 0
    let xpRequired = 0
    while (xp >= xpRequired && lvl <= settings["maxLevel"]) {
        lvl++
        previousLevel = xpRequired
        xpRequired = xpForLevel(lvl, settings)
    }
    lvl--
    return returnReq ? { level: lvl, xpRequired, previousLevel } : lvl
}
function commafy(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
