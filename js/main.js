class App{
    constructor(){
        this.start();
      
        this.config = {
            colorScheme: ['green','yellow','red'],
            targetSentenceLengths: [0,15,25],
        }
    }
    start(){
        console.log('app running');

        this.analyzeTextButton = document.querySelector('#analyze-text-button');
        
        this.analyzeTextButton.addEventListener('click', () => {
            this.analyzeText();
        });

        this.inputText = document.querySelector('#input-text');
        this.inputText.addEventListener("paste", (e) => {
            // Get new paste
            const paste = (e.clipboardData || window.clipboardData).getData("text");

            console.log('paste',paste);
            this.testInputText();
            // Get "old" textarea content (without latest paste)
             this.inputText.value = paste;

        });

        this.inputText.addEventListener('change', () => {
            this.testInputText();
        })

        this.results = document.querySelector('#results');
        this.resultsContainer = document.querySelector('#results-container');

        this.statsElements = {
            totalWordCount: document.querySelector('#total-word-count'),
            totalSentenceCount: document.querySelector('#total-sentence-count'),
            totalSyallableCount: document.querySelector('#total-syallable-count'),
            totalFRE: document.querySelector('#total-fre'),
            totalGrade: document.querySelector('#total-grade'),
        }

        

        this.randomSampleTextButton = document.querySelector('#random-sample-text-button');
        this.randomSampleTextButton.addEventListener('click', () => {
            this.addRandomSampleText();
        })

        console.log(this.statsElements.totalWordCount);
    }
    analyzeText = async () => {
        console.log('analyzing....');
        this.setAnaylzeButton(true, "Analyzing...");
        console.log(this.inputText.value);
        const text = this.inputText.value;
        const parsedTextResult = await parseSentence(text, this.config, this.colorScheme, this.config.targetSentenceLengths);
        console.log('parsedTextResult',parsedTextResult);
        this.buildSentences(parsedTextResult.sentences);
        console.log(this.statsElements);
        this.statsElements.totalWordCount.innerText = parsedTextResult.stats.totalWords;
        this.statsElements.totalSentenceCount.innerText = parsedTextResult.stats.totalSentences;
        this.statsElements.totalSyallableCount.innerText = parsedTextResult.stats.totalSyllables;
    }

    buildSentences = (sentences) => {
        console.log('building sentences');
        while(this.results.firstChild){
            this.results.removeChild(this.results.firstChild);
        }
        //console.log(sentences);
        sentences.forEach(s => {
            const label = document.createElement('label');
            label.setAttribute('title',`Words: ${s.stats.numWords} | Syllables ${s.stats.numSyllables} | Grade: ${0}`);
            const el = document.createElement('span');
            el.innerHTML = s.text;
            el.style.backgroundColor = s.color;
            el.addEventListener('mouseover',()=>{console.log('hover!')});
            el.addEventListener('click',()=>{console.log('click!')});
            label.appendChild(el);
            this.results.appendChild(label);
        })
        this.EndAnalysis();
    }

    EndAnalysis(){
        console.log('ending analysis')
        this.resultsContainer.className = "";
        this.analyzeTextButton.innerText = "Analyze Text";
        this.setAnaylzeButton(false, "Analyze Again");
        location.href = "#results";
        
    }
    testInputText(){
        console.log("testing sample text", this.inputText.value);
        if(this.inputText.value === ""){
            this.setAnaylzeButton(true);
        } else {
            this.setAnaylzeButton(false);
        }
    }
    setAnaylzeButton(disable, text){
        if(disable){
            this.analyzeTextButton.setAttribute("disabled", "disabled");
        } else {
            this.analyzeTextButton.removeAttribute("disabled");
        }
        if(text){
            this.analyzeTextButton.innerText = text;
        }
    }
    addRandomSampleText(){
        console.log(Math.floor(Math.random() * samples.length));
        this.inputText.value = samples[Math.floor(Math.random() * samples.length)];
        this.testInputText();
    }
}

window.addEventListener('load',() => {
   console.log('onload')
   location.href = "#header";
   new App();
});



