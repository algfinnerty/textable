function parseSentence(text, colorScheme, config, targetSentenceLengths){
    console.log('Parsing text:', text);
    const indexes = getAllIndexes(text,". ");
    //console.log(indexes);

    //get overall statistics
    let totalWords = 0;
    let totalSyllables = 0;

    //break into sentances
    const sentences = [];
    const sentencesPlain = [];
    let lastI = 0;
    indexes.forEach((i,n) => {
        const s = text.slice(lastI,i + 1).trim();
        sentencesPlain.push(s);

        //get sentance level stats
        const words = s.split(" "); 
        const numWords = words.length;
        totalWords += numWords;
        let numSyllables = 0;
        const wordArray = [];
        words.forEach(w => {
            const syllables = countSylablles(w);
            numSyllables += syllables;
        })

        totalSyllables += numSyllables;

        const sentenceStats = {
            numWords: words.length,
            numWordsRating: words.length > targetSentenceLengths[2] ? "poor" : words.length > targetSentenceLengths[1] ? "fair" : "good",
            numSyllables: numSyllables,
            color: numWords > targetSentenceLengths[2] ? "red" : numWords > targetSentenceLengths[1] ? "yellow" : "green"
        }

        sentences.push(new Sentence('sentence_'+n,s,sentenceStats));
        lastI = i + 1;
    })
    console.log(sentences)
    const result = {sentences:sentences, 
                    stats: {
                        totalSentences:sentences.length, 
                        totalWords:totalWords,
                        totalSyllables:totalSyllables,
                        totalFRE: calculateFRE(totalWords,sentences.length,totalSyllables),
                        totalGrade: calculateGradeLevel(totalWords,sentences.length,totalSyllables)
                    }};
    return result;
}


function getAllIndexes(arr, val) {
    var indexes = [], i = -1;
    while ((i = arr.indexOf(val, i+1)) != -1){
        indexes.push(i);
    }
    return indexes;
}

function countSylablles(word){
    word = word.toLowerCase();
    let count = 0;
    vowels = 'aeiou';
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

// # Syllable computation
// def num_syllables(word):
//     word = word.lower()
//     count = 0
//     vowels = "aeiouy"
//     if word[0] in vowels:
//         count += 1
//     for index in range(1, len(word)):
//         if word[index] in vowels and word[index - 1] not in vowels:
//             count += 1
//     if word.endswith("e"):
//         count -= 1
//     if count == 0:
//         count += 1
//     return count

function calculateFRE(numWords, numSentences, numSyllables){
    return Math.round(206.835 -
        (1.015 * (numWords / numSentences)) -
        (84.6 * (numSyllables / numWords)), 3)
}

function calculateGradeLevel(numWords, numSentences, numSyllables){
    return Math.round((0.39 * (numWords / numSentences)) +
                        (11.8 * (numSyllables / numWords))
                        - 15.59, 3)
}