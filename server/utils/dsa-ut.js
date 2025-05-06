import { readFileSync } from "fs";
import Autocorrect from "autocorrect";
import lemmatizer from "wink-lemmatizer";
import keyword_extractor from "keyword-extractor";
import { performance } from "perf_hooks";
import { fileURLToPath } from "url";
import path from "path";
import { pipeline } from '@xenova/transformers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// import idToData from "../data/idToData.json" assert { type: "json" };
// import IDF from "../data/IDF.json" assert { type: "json" };
// import TF_IDF from "../data/TF_IDF.json" assert { type: "json" };
// import BM25 from "../data/BM25.json" assert { type: "json" };

export const idToData = JSON.parse(readFileSync(path.resolve(__dirname, "../data/idToData.json")));
export const IDF = JSON.parse(readFileSync(path.resolve(__dirname, "../data/IDF.json")));
export const TF_IDF = JSON.parse(readFileSync(path.resolve(__dirname, "../data/TF_IDF.json")));
export const BM25 = JSON.parse(readFileSync(path.resolve(__dirname, "../data/BM25.json")));

const rectify = Autocorrect();

const stripPunctuations = (str) => str.replace(/[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g, " ");

const processStr = (str, autocorrect) => {
  // spell correction & lemmatization
  return stripPunctuations(str)
    .split(" ")
    .flatMap((word) => {
      const w = autocorrect === "yes" ? rectify(word) : word;
      const words = {};
      words[w] = 1;
      words[lemmatizer.noun(w)] = 1;
      words[lemmatizer.adjective(w)] = 1;
      words[lemmatizer.verb(w)] = 1;
      return Object.keys(words);
    })
    .join(" ");
};

const getKeywords = (str) => {
  return keyword_extractor.extract(str, {
    language: "english",
    remove_digits: true,
    return_changed_case: true,
  });
};

export const findResults_bm25 = (search, autocorrect, filter, page, limit) => {
  const startTime = performance.now();
  const kWords = getKeywords(processStr(search.toLowerCase(), autocorrect));
  // BM25 scores
  const scores = {};
  Object.keys(BM25).forEach((id) => {
    let bm25 = 0;
    kWords.forEach((kWord) => (bm25 += BM25[id][kWord] || 0));
    scores[id] = bm25;
  });
  const results = Object.keys(scores)
    .sort((a, b) => {
      if (!scores[a]) return 1;
      else if (!scores[b]) return -1;
      else return scores[b] - scores[a];
    })
    .filter((id) => (filter === "all" ? true : idToData[id].platform.toLowerCase() === filter.toLowerCase()))
    .slice(0, 50)
    .map((id) => idToData[id]);
  const endTime = performance.now();
  return { data: results.slice((page - 1) * limit, page * limit), time: endTime - startTime, count: results.length };
};

export const findResults_tfIdf = (search, autocorrect, filter, page, limit) => {
  const startTime = performance.now();
  const kWords = getKeywords(processStr(search.toLowerCase(), autocorrect));
  let sq_A = 0;
  const tf_idf = {};
  kWords.forEach((kWord) => {
    if (!tf_idf[kWord]) tf_idf[kWord] = 0;
    tf_idf[kWord] += 1 / kWords.length;
  });
  Object.keys(tf_idf).forEach((kWord) => {
    tf_idf[kWord] = (IDF[kWord] || 0) * tf_idf[kWord];
    sq_A += tf_idf[kWord] * tf_idf[kWord];
  });
  const similarity = {};
  Object.keys(TF_IDF).forEach((id) => {
    let sim = 0,
      sq_B = 0;
    Object.keys(TF_IDF[id]).forEach((kWord) => {
      sim += TF_IDF[id][kWord] * (tf_idf[kWord] || 0);
      sq_B += TF_IDF[id][kWord] * TF_IDF[id][kWord];
    });
    sim = sim / (Math.sqrt(sq_A) * Math.sqrt(sq_B));
    similarity[id] = sim;
  });
  const results = Object.keys(similarity)
    .sort((a, b) => {
      if (!similarity[a]) return 1;
      else if (!similarity[b]) return -1;
      else return similarity[b] - similarity[a];
    })
    .filter((id) => (filter === "all" ? true : idToData[id].platform.toLowerCase() === filter.toLowerCase()))
    .slice(0, 50)
    .map((id) => idToData[id]);
  const endTime = performance.now();
  return { data: results.slice((page - 1) * limit, page * limit), time: endTime - startTime, count: results.length };
};

let embeddingModel = null;
const initBertModel = async () => {
    if (!embeddingModel) {
        try {
            // Load the embedding model - using a smaller BERT variant for efficiency
            embeddingModel = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
            console.log('BERT embedding model loaded successfully');
        } catch (error) {
            console.error('Error loading BERT model:', error);
            throw error;
        }
    }
    return embeddingModel;
};

// Cache for document embeddings to avoid recomputing
const documentEmbeddings = {};

// Generate embedding for a text string
const generateEmbedding = async (text) => {
    const model = await initBertModel();
    const result = await model(text, { pooling: 'mean', normalize: true });
    return result.data;
};

// Calculate cosine similarity between two vectors
const cosineSimilarity = (vecA, vecB) => {
    let dotProduct = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
    }
    // Vectors are already normalized, so dot product equals cosine similarity
    return dotProduct;
};

// Precompute embeddings for all documents (call this during initialization)
export const precomputeDocumentEmbeddings = async () => {
    console.log('Precomputing document embeddings...');
    const startTime = performance.now();

    for (const id of Object.keys(idToData)) {
        // Create a representative text from the document
        const doc = idToData[id];
        const text = `${doc.title} ${doc.description}`.toLowerCase();

        // Generate and store embedding
        documentEmbeddings[id] = await generateEmbedding(text);
    }

    const endTime = performance.now();
    console.log(`Precomputed embeddings for ${Object.keys(documentEmbeddings).length} documents in ${endTime - startTime}ms`);
};

export const findResults_bert = async (search, autocorrect, filter, page, limit) => {
    const startTime = performance.now();

    // Process the search query
    const processedQuery = processStr(search.toLowerCase(), autocorrect);

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(processedQuery);

    // Calculate similarity scores
    const scores = {};
    for (const id of Object.keys(documentEmbeddings)) {
        scores[id] = cosineSimilarity(queryEmbedding, documentEmbeddings[id]);
    }

    // Sort and filter results
    const results = Object.keys(scores)
        .sort((a, b) => scores[b] - scores[a])
        .filter((id) => (filter === "all" ? true : idToData[id].platform.toLowerCase() === filter.toLowerCase()))
        .slice(0, 50)
        .map((id) => idToData[id]);

    const endTime = performance.now();
    return {
        data: results.slice((page - 1) * limit, page * limit),
        time: endTime - startTime,
        count: results.length
    };
};
