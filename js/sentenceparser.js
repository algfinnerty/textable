function parseSentences(text, config){
    
    //get overall statistics
    let totalSentences = 0;
    let totalWords = 0;
    let totalSyllables = 0;
    const longestWords = [];

     //break into paragraphs
     var paras = text.split('\n').filter(p => p.trim() != "");
     console.log('paras',paras); 

     const paragraphs = [];
     

     paras.forEach((p,q)=> {
        const indexes = getAllIndexes(p);
        let wordsInParagraph = 0;
        let syllablesInParagraph = 0;
         //break into sentances
        const sentences = [];
        const sentencesPlain = [];
        let lastI = 0;
        indexes.forEach((i,n) => {
            const s = p.slice(lastI,i + 1).trim();
            sentencesPlain.push(s);
            //get sentance level stats
            const words = s.split(" "); 
            const numWords = words.length;
            totalWords += numWords;
            wordsInParagraph += numWords;
            let numSyllables = 0;
            const wordArray = [];
            let longestWord = "";
            words.forEach(w => {
                const syllables = countSylablles(w);
                numSyllables += syllables;
                syllablesInParagraph += syllables;
                if(w.length >= longestWord){
                    longestWord = w;
                }
            })

            totalSyllables += numSyllables;

            const numWordsRating = words.length > config.targetSentenceMax ? 0 : words.length > config.targetSentenceMin ?  2: 1;
            const numSyllablesRating = numSyllables/words.length > 4 ? 0 : numSyllables/words.length > 3 ? 1 : 2;
            const totalRating = numWordsRating;

            const sentenceStats = {
                numWords: words.length,
                numWordsRating: numWordsRating,
                numSyllables: numSyllables,
                numSyllablesRating: numSyllablesRating,
                fre: calculateFRE(words.length,1,numSyllables),
                grade: calculateGradeLevel(words.length,1,numSyllables),
                longestWords: words.sort((a,b) => b.length - a.length).splice(0,5),
                color: config.colorScheme[totalRating]
            }

            sentences.push(new Sentence('paragraph_'+q+'-sentence_'+n,s,n+1,sentenceStats,words));
            lastI = i + 1;
        });
        totalSentences += sentences.length;
        const paragraphStats = {
            numWords: wordsInParagraph,
            numSyllables: syllablesInParagraph,
            fre: calculateFRE(wordsInParagraph,sentences.length,syllablesInParagraph),
            grade: calculateGradeLevel(wordsInParagraph,sentences.length,syllablesInParagraph)
        }
        paragraphs.push(new Paragraph('paragraph_'+q,paragraphStats,sentences))
     })
     

   
    const result = {paragraphs:paragraphs, 
                    stats: {
                        totalParagraphs: paras.length,
                        totalSentences:totalSentences, 
                        totalWords:totalWords,
                        totalSyllables:totalSyllables,
                        totalFRE: calculateFRE(totalWords,totalSentences,totalSyllables),
                        totalGrade: calculateGradeLevel(totalWords,totalSentences,totalSyllables),
                        totalSentencesPerPara: Math.round(totalSentences/paras.length),
                        totalWordsPerSentence: Math.round(totalWords/totalSentences),
                    }};
    return result;
}

function getAllIndexes(string) {
    var indexes = [];
    let endPunc = '.!?';
    for(let i = 0; i < string.length; i++){
        if(endPunc.includes(string[i])){
            indexes.push(i);
        }
    }
    return indexes;
}

function countSylablles(word){
    word = word.toLowerCase();
    let count = 0;
    let vowels = 'aeiou';
    if(vowels.indexOf(word[0]) != -1){
        count += 1;
    }
    for(let i = 0; i < word.length; i++){
        if(i > 0 && vowels.indexOf(word[i]) != -1 && vowels.indexOf(word[i - 1]) === -1){
            count += 1;
        }
    }
    if(word[word.length - 1] === 'e'){
        count += 1;
    }
    if(count === 0){
        count += 1
    }
    return count
}

function calculateFRE(numWords, numSentences, numSyllables){
    return Math.round(206.835 -
        (1.015 * (numWords / numSentences)) -
        (84.6 * (numSyllables / numWords)), 3)
}

function calculateGradeLevel(numWords, numSentences, numSyllables){
    const x = (0.39 * (numWords / numSentences))+(11.8 * (numSyllables / numWords)- 15.59)
    return Math.round(x*100)/100
}