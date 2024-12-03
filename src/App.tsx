import './App.css';

function App() {
  function repartitionEquitable(tab: number[], nb: number): number[][] {
    const newTab: number[][] = [];
    for (let i = 0; i < tab.length; i += nb) {
      newTab.push(tab.slice(i, i + nb));
    }

    for (let k = 0; k < newTab.length; k++) {
      if (newTab[k].length !== nb) {
        const extraElements = newTab[k];
        newTab.splice(k, 1); 
        extraElements.forEach(element => {
          const randomIndex = Math.floor(Math.random() * newTab.length);
          newTab[randomIndex].push(element);
        });
      }
    }

    return newTab;
  }

  console.log(repartitionEquitable([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3));
  console.log(repartitionEquitable([0, 1, 0, 1, 0, 1, 0, 1], 3));

  return (
    <div>
      <h1>Data Table</h1>
    </div>
  );
}

export default App;
