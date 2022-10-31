let day = 100;
let resolution = 100;
let turn = 1;
let curBuy = {};
let curSell = {};

google.charts.load("current", { packages: ["corechart"] });

google.charts.setOnLoadCallback(drawChart);

// Set chart options
  var chartOptions = {
    title: "Stock Performance",
    width: 800,
    height: 300,
    chartArea: {
      width: '50%'
    }
  };

function drawChart() {
  let header = ["step"].concat(
    companies.map(c => {
      return c.name;
    })
  );
  let table = [header];
  
  for (var i = day - resolution; i < day; i++) {
    let row = [i].concat(
      companies.map(c => {
        return c.price[i];
      })
    );
    table.push(row);
  }
  // Create the data table.
  var data = new google.visualization.arrayToDataTable(table);
  

  // Instantiate and draw our chart, passing in some options.
  var chart = new google.visualization.LineChart(
    document.getElementById("chart_div")
  );
  chart.draw(data, chartOptions);
  
  let t = `
  <table>
    <th>Ticker</th>
    <th>Name</th>
    <th>Price</th>
    <th>Owned</th>
    <th>Buy Order</th>
    <th>Sell Order</th>
    `+
    companies.map((c)=>{
    let curPrice = c.price[c.price.length-1];
    return `<tr>
              <td>${c.id}</td>
              <td>${c.name}</td>
              <td>${curPrice}</td>
              <td>${player.stocks[c.id] || 0}</td>
              <td><input type="number" min="0" data-action="buy" data-ticker="${c.id}"></td>
              <td><input type="number" min="0" max="${player.stocks[c.id] || 0}" data-action="sell" data-ticker="${c.id}"></td>
          </tr>`
  })
  +`</table>`;
  
  document.getElementById('prices').innerHTML = t;
  
  document.getElementById('balance').innerHTML = player.money;
  document.getElementById('turn').innerHTML = turn;
}

let companies = [
  {
    id: "META",
    name: "Meta Platforms Inc",
    price: [112.51]
  },
  {
    id: "UNI",
    name: "Unicorp",
    price: [145]
  },
  {
    id: "DUCK",
    name: "The Duck",
    price: [125]
  },
  {
    id: "MSFT",
    name: "Microsoft Corporation ",
    price: [251]
  },
  {
    id: "AAPL",
    name: "Apple Inc.",
    price: [126]
  },
 
  {
    id: "AMZN",
    name: "Amazon.com, Inc",
    price: [3262]
  },
  {
    id: 'GOOGL',
    name: 'Alphabet Inc.',
    price: [2360]
  },
  {
    id: 'TSLA',
    name: 'Tesla Inc.',
    price: [600]
  }
];

function step(render) {
  companies.forEach(c => {
    let p = c.price[c.price.length - 1];
    let n;
    if (!c.trend) {
      n = Math.round(p * (0.93 + Math.random() * 0.15));
      if (Math.random() < 0.01) {
        c.trend = "down";
      } else if (Math.random() < 0.01) {
        c.trend = "up";
      }
    } else {
      switch (c.trend) {
        case "down":
          n = Math.round(p * (0.85 + Math.random() * 0.16));
          if (Math.random() < 0.15) {
            c.trend = null;
          }
          break;
        case "up":
          n = Math.round(p * (1 + Math.random() * 0.08));
          if (Math.random() < 0.2) {
            c.trend = null;
          }
          break;
      }
    }

    c.price.push(n);
  });
  if(render){
    turn++;
    day++;
    drawChart();
  }
}

for (var i = 0; i < day; i++) {
  step();
}

let player = {
  money: 100000,
  stocks: {}
}

function next(){
  
  Object.keys(curBuy).forEach((ticker)=>{
    player.money -= getCurPrice(ticker) * curBuy[ticker];
    player.stocks[ticker] = player.stocks[ticker] || 0;
    player.stocks[ticker] += curBuy[ticker];
  });
  Object.keys(curSell).forEach((ticker)=>{
    player.money += getCurPrice(ticker) * curSell[ticker]; 
    player.stocks[ticker] = player.stocks[ticker] || 0;
    player.stocks[ticker] -= curSell[ticker];
  });
  
  step(true);
}

function validate(){
  var sellAmt = 0;
  curBuy = {};
  curSell = {};
  document.querySelectorAll('[data-action="sell"]').forEach((n)=> {
    if(n.value){
      curSell[n.dataset.ticker] = parseInt(n.value);
      sellAmt += parseInt(n.value) * getCurPrice(n.dataset.ticker)
    }
  });
  
  var buyAmt = 0;
  document.querySelectorAll('[data-action="buy"]').forEach((n)=> {
    if(n.value){
      curBuy[n.dataset.ticker] = parseInt(n.value);
      buyAmt += parseInt(n.value) * getCurPrice(n.dataset.ticker)
    }
  });
  
  if(player.money + sellAmt - buyAmt <= 0){
    return false;
  }
  
  return true;
}

function getCurPrice(ticker){
  let company = companies.find((c)=> {
    return c.id === ticker;
  });
  
  return company.price[company.price.length-1];
}

document.getElementById('nextDay').addEventListener('click', function(event){
  if(validate()){
    next();
  }
})
