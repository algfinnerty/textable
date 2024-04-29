class App{
    constructor(){
        this.start();
        this.currentParagraphs = [];
        this.currentExample = null;
        this.config = {
            colorScheme: ['#f35858','#f9f982','#20d920'],
            targetSentenceMin: 5,
            targetSentenceMax: 20,

        }
    }
    start(){
        //scroll to top in case of partial reload
        window.scrollTo({ top: 0, behavior: 'smooth' });

        this.buildExamples();

        //init buttons/inputs
        this.analyzeTextButton = document.querySelector('#analyze-text-button');
        this.analyzeTextButton.addEventListener('click', () => this.analyzeText());

        document.querySelector('#clear-text-button').addEventListener('click', ()=> this.clearText());

        this.inputText = document.querySelector('#input-text');
        this.inputText.addEventListener("paste", (e) => {
            const paste = (e.clipboardData || window.clipboardData).getData("text");
            this.testInputText();
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
            totalParas: document.querySelector('#total-para-count'),
            totalSentencesPerPara: document.querySelector('#total-sentence-per-para'),
            totalWordsPerSentence: document.querySelector('#total-words-per-sentence'),
        }

        this.aside = document.querySelector('aside');
        this.asideContent = document.querySelector('#aside-content');
        document.querySelector('#close-aside-button').addEventListener('click',()=>this.closeAside())
        
        this.randomSampleTextButton = document.querySelector('#random-sample-text-button');
        this.randomSampleTextButton.addEventListener('click', () => this.addRandomSampleText())

        this.background = document.querySelector('#background');
       
    }
    analyzeText = async () => {
        console.log('analyzing....');
        this.setAnaylzeButton(true, "Analyzing...");
        console.log(this.inputText.value);
        const text = this.inputText.value;
        const parsedTextResult = await parseSentences(text, this.config);
        console.log('parsedTextResult');
        console.log(parsedTextResult);
        this.currentParagraphs = parsedTextResult.paragraphs;
        this.buildResult(parsedTextResult.paragraphs);

        //update result statistics
        this.statsElements.totalWordCount.innerText = parsedTextResult.stats.totalWords;
        this.statsElements.totalSentenceCount.innerText = parsedTextResult.stats.totalSentences;
        this.statsElements.totalSyallableCount.innerText = parsedTextResult.stats.totalSyllables;
        this.statsElements.totalFRE.innerText = parsedTextResult.stats.totalFRE;
        this.statsElements.totalGrade.innerText = parsedTextResult.stats.totalGrade;
        this.statsElements.totalParas.innerText = parsedTextResult.stats.totalParagraphs;
        this.statsElements.totalSentencesPerPara.innerText = parsedTextResult.stats.totalSentencesPerPara;
        this.statsElements.totalWordsPerSentence.innerText = parsedTextResult.stats.totalWordsPerSentence;
    }
    buildResult = (paragraphs) => {
        console.log('building result');
        while(this.results.firstChild){
            this.results.removeChild(this.results.firstChild);
        }
        if(paragraphs.length > 1){
            paragraphs.forEach((p,n) => {
                const wrapper = document.createElement('div');
                wrapper.className = n % 2 === 0 ? 'paragraph w100' : 'paragraph even w100';
                
                const selector = document.createElement('button');
                selector.className = 'paragraph-selector';
                selector.id = p.id;
                selector.innerText = n + 1;
                selector.addEventListener('click',(e)=>{
                    console.log('opening para');
                    console.log(e.target.id);
                    const idSplit = e.currentTarget.id.split('-');
                    this.openAside(idSplit[0]);
                });
                wrapper.appendChild(selector);
                
                const sentenceContainer = document.createElement('div');
                sentenceContainer.className = 'sentence-container';
                wrapper.appendChild(sentenceContainer);
                this.results.appendChild(wrapper);
                this.buildSentences(p.sentences,sentenceContainer);

            })
        } else {
            this.buildSentences(paragraphs[0].sentences, this.results)
        }
        this.endAnalysis();
    }
    buildSentences = (sentences,container) => {
        console.log('building sentences');
        console.log(sentences);
        sentences.forEach(s => {
            this.buildSentence(container,s)
        })
    }
    endAnalysis(){
        console.log('ending analysis')
        this.resultsContainer.className = "";
        this.analyzeTextButton.innerText = "Analyze Text";
        this.setAnaylzeButton(false, "Analyze Again");
        const resRect = this.resultsContainer.getClientRects()[0];
        window.scrollTo({ top: resRect.y, behavior: 'smooth' });
    }
    openAside = (paraId, sentenceId) => {
        console.log(paraId, sentenceId);
        while(this.asideContent.firstChild){
            this.asideContent.removeChild(this.asideContent.firstChild);
        }
        console.log('current paras');
        console.log(this.currentParagraphs);
        
        const para = this.currentParagraphs.filter(p => p.id === paraId)[0];
        console.log("found para");
        console.log(para);

        if(sentenceId){
            //only load specific sentence
            var s = para.sentences.filter(s => s.id === paraId + "-" + sentenceId)[0];
            console.log("found s");
            console.log(s);
            const h = document.createElement('h2');
            h.innerText = s.text;
            this.asideContent.appendChild(h);

            const wordCount = document.createElement('label');
            wordCount.innerHTML = `Number of Words: <span class='stat-value'>${s.stats.numWords}</span>`
            this.asideContent.appendChild(wordCount);

            const syallableCount = document.createElement('label');
            syallableCount.innerHTML = `Number of Syllables: <span class='stat-value'>${s.stats.numSyllables}</span>`
            this.asideContent.appendChild(syallableCount);

            const fre = document.createElement('label');
            fre.innerHTML = `FRE Raw: <span class='stat-value'>${s.stats.fre}</span>`
            this.asideContent.appendChild(fre);

            const grade = document.createElement('label');
            grade.innerHTML = `Grade Level: <span class='stat-value'>${s.stats.grade}</span>`
            this.asideContent.appendChild(grade);

            const longestWords = document.createElement('label');
            longestWords.innerHTML = `Longest Words: <span class='stat-value'>${s.stats.longestWords.join(', ')}</span>`
            this.asideContent.appendChild(longestWords);

        } else {
            //display entire paragraph
            const fieldset = document.createElement('fieldset');
            const legend = document.createElement('legend');
            legend.innerText = 'Paragraph Statistics';
            fieldset.appendChild(legend);

            const wordCount = document.createElement('label');
            wordCount.innerHTML = `Number of Words: <span class='stat-value'>${para.stats.numWords}</span>`
            fieldset.appendChild(wordCount);

            const syallableCount = document.createElement('label');
            syallableCount.innerHTML = `Number of Syllables: <span class='stat-value'>${para.stats.numSyllables}</span>`
            fieldset.appendChild(syallableCount);

            const fre = document.createElement('label');
            fre.innerHTML = `FRE Raw: <span class='stat-value'>${para.stats.fre}</span>`
            fieldset.appendChild(fre);

            const grade = document.createElement('label');
            grade.innerHTML = `Grade Level: <span class='stat-value'>${para.stats.grade}</span>`
            fieldset.appendChild(grade);

            // const longestWords = document.createElement('label');
            // longestWords.innerHTML = `Longest Words: <span class='stat-value'>${para.stats.longestWords.join(', ')}</span>`
            // this.asideContent.appendChild(longestWords);

            this.asideContent.appendChild(fieldset);

            para.sentences.forEach(s => {
                this.buildSentence(this.asideContent,s.text, s.id, s.color, s.stats);
            })
        }
        
        this.background.removeAttribute('hidden');
        this.aside.removeAttribute("hidden");
    }
    buildSentence = (container, sentence) => {
        const wrapper = document.createElement('span');
        wrapper.className = 'sentence';
        wrapper.id = sentence.id;
        const label = document.createElement('label');
        label.className = 'sentence-label';
        label.setAttribute('title',`Words: ${sentence.stats.numWords} | Syllables ${sentence.stats.numSyllables} | Grade: ${sentence.stats.grade}`);
        wrapper.appendChild(label);
        const tag = document.createElement('span');
        tag.className = 'sentence-tag';
        tag.innerText = "Sentence " + sentence.num;
        label.appendChild(tag);
        
        const el = document.createElement('span');
        el.className = 'sentence-text';
        el.innerHTML = sentence.text;
        el.style.backgroundColor = sentence.color;
        //el.addEventListener('mouseover',()=>{console.log('hover!')});
        wrapper.addEventListener('click',(e)=>{
            console.log('opening sentence');
            console.log(e.currentTarget.id);
            const idSplit = e.currentTarget.id.split('-');
            this.openAside(idSplit[0],idSplit[1]);
        });
        wrapper.appendChild(el);
        container.appendChild(wrapper);
    } 
    testInputText(){
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
    clearText(){
        this.inputText.value = '';
    }
    addRandomSampleText(){
        let r = Math.floor(Math.random() * samples.length);
        if(r === this.currentExample){
            r = this.currentExample + 1 > samples.length - 1 ? 0 : this.currentExample + 1;
        }
        this.inputText.value = samples[r].text;
        this.currentExample = r;
        this.testInputText();
    }
    openModal(){
        this.modal.removeAttribute('hidden');
        this.background.removeAttribute('hidden');
    }
    closeModal(){
        this.modal.setAttribute('hidden',true);
        this.background.setAttribute('hidden',true);
    }
    closeAside(){
        this.aside.setAttribute('hidden',true);
        this.background.setAttribute('hidden',true);
    }
    buildExamples(){
        const container = document.querySelector('#examples-container');
        samples.forEach(s => {
            const article = this.buildElement('article',container,'example-article');
            this.buildElement('h3',article,'example-title', null,s.title);
            const blockquote = this.buildElement('blockquote',article,'example-blockquote', null,s.text);
            
            const attribution = this.buildElement('label',article,'example-attribution w100 right');
            const img = this.buildElement('img',attribution,'author-img');
            img.src = s.authorImg;
            const column = this.buildElement('div',attribution,'column');
            this.buildElement('span',column,'author-name',null,s.author);
            this.buildElement('span',column,'speech',null,s.subheading);
            
            article.appendChild(attribution);
            container.appendChild(article);


        })
    }
    buildElement(elementType,container,className,id,text){
        console.log(elementType,className,id,text);
        console.log(container);
        const el = document.createElement(elementType);
        if(className){el.className = className};
        if(id){el.id = id};
        if(text){el.innerText = text};
        if(container){container.appendChild(el)}
        return el
    }
}

window.scrollTo({ top: 0, behavior: 'smooth' });
window.addEventListener('load',() => {
   new App();
});



