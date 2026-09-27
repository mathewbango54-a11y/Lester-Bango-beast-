const express=require('express');
const axios=require('axios');
const cheerio=require('cheerio');
const cors=require('cors');
const cron=require('node-cron');
const app=express();
app.use(cors());
app.use(express.json());
let history=[[3,11,18,27,34],[7,14,22,29,36],[2,9,15,24,31],[5,12,19,26,33],[1,8,16,23,30],[4,10,17,28,35],[6,13,20,25,32],[2,11,21,29,34],[3,9,18,27,36],[5,14,19,24,30]];
async function scrapeDailyLotto(){
try{
console.log('BEAST scraping');
let url='https://www.nationallottery.co.za/results/daily-lotto';
let res=await axios.get(url,{headers:{'User-Agent':'Mozilla/5.0'},timeout:15000});
let $=cheerio.load(res.data); let numbers=[];
$('.balls.ball,.ball').each((i,el)=>{let n=parseInt($(el).text().trim()); if(n>=1&&n<=36&&numbers.length<5) numbers.push(n);});
numbers=[...new Set(numbers)].slice(0,5).sort((a,b)=>a-b);
if(numbers.length===5){history.unshift(numbers); if(history.length>500) history.pop(); console.log('CAPTURED',numbers); return numbers;}
}catch(e){console.log('scrape fail',e.message);}
return null;
}
function analyze(){
let counts={}; history.forEach(d=>d.forEach(n=>counts[n]=(counts[n]||0)+1));
let overdue={}; history.forEach((draw,idx)=>{draw.forEach(n=>{if(overdue[n]===undefined) overdue[n]=idx;})});
for(let i=1;i<=36;i++) if(overdue[i]===undefined) overdue[i]=999;
let hot=Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,8).map(x=>+x[0]);
let cold=Object.entries(overdue).sort((a,b)=>b[1]-a[1]).slice(0,8).map(x=>+x[0]);
let combos=[];
for(let a=0;a<2000&&combos.length<5;a++){
let c=[];while(c.length<5){let n=Math.floor(Math.random()*36)+1;if(!c.includes(n))c.push(n)} c.sort((a,b)=>a-b);
let total=c.reduce((x,y)=>x+y,0); if(total<80||total>130) continue;
let odds=c.filter(n=>n%2==1).length; if(odds==0||odds==5) continue;
if(!c.some(n=>hot.includes(n))||!c.some(n=>cold.includes(n))) continue;
let score=85+Math.floor(Math.random()*11); if(total>=85&&total<=115) score+=3;
combos.push({numbers:c,score,sum:total});
}
combos.sort((a,b)=>b.score-a.score);
return{hot,cold,counts,latest:history[0],totalDraws:history.length,combos,history:history.slice(0,10),lastUpdate:new Date().toISOString()};
}
app.get('/',(req,res)=>{res.json({status:'Lesabaango Beast Online',owner:'Lester Bango',car:'Ford Mustang GT',draws:history.length});});
app.get('/api/predict',(req,res)=>{res.json(analyze());});
app.get('/api/history',(req,res)=>{res.json({history});});
app.get('/api/scrape-now',async(req,res)=>{let r=await scrapeDailyLotto(); res.json({scraped:r,history:history.slice(0,5)});});
cron.schedule('5 19 * * *',async()=>{await scrapeDailyLotto();});
cron.schedule('0 * * * *',async()=>{await scrapeDailyLotto();});
const PORT=process.env.PORT||3000;
app.listen(PORT,()=>console.log('BEAST RUNNING '+PORT));
