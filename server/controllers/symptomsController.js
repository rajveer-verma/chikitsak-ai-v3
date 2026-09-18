import { diseaseDataset } from "../data/diseaseData.js";

/**
 * Controller for symptom assessment
 * POST /api/symptoms
 * Body: { symptoms: ["headache", "fever", "cough"] }
 */
export const checkSymptoms = async (req, res, next) => {
  try {
    const { symptoms } = req.body; //Destructuring

    // 1. Validation: check presence
    if (!symptoms) {
      return res.status(400).json({
        error: "Missing symptoms field in request body",
        received: req.body
      });
    }

    // 2. Validation: check array type
    if (!Array.isArray(symptoms)) {
      return res.status(400).json({
        error: "Symptoms must be provided as an array of strings",
        received: typeof symptoms
      });
    }

    // 3. Validation: check non-empty array
    if (symptoms.length === 0) {
      return res.status(400).json({
        error: "Symptoms array cannot be empty"
      });
    }

    // 4. Normalize user symptoms: trim whitespace and lowercase
    const normalizedUserSymptoms = symptoms
      .map(s => (typeof s === "string" ? s.trim().toLowerCase() : ""))
      .filter(s => s.length > 0);

    if (normalizedUserSymptoms.length === 0) {
      return res.status(400).json({
        error: "Please provide valid symptom strings"
      });
    }

    // 5. Symptom matching engine: compare against disease dataset
    const matchResults = diseaseDataset.map(entry => {
      let matchCount = 0;
      const matchedSymptoms = new Set();

      //Compare with every symptom of disease
      for (const userSym of normalizedUserSymptoms) {
        for (const diseaseSym of entry.symptoms) {

          //Lowercase comparison
          const lowerDiseaseSym = diseaseSym.toLowerCase();

          // Check direct equality or substring inclusion
          // Actual matching condition
          if (
            lowerDiseaseSym === userSym ||
            lowerDiseaseSym.includes(userSym) ||
            userSym.includes(lowerDiseaseSym)
          ) {
            matchedSymptoms.add(diseaseSym);
          }
        }
      }

      matchCount = matchedSymptoms.size;

      return {
        disease: entry.disease,
        matches: matchCount
      };
    });

    // 6. Filter conditions with at least 1 match & sort descending by match count
    //Remove zero-match diseases
    const rankedResults = matchResults
      .filter(item => item.matches > 0)
      .sort((a, b) => b.matches - a.matches); //descending order sorting

    // 7. Return response formatted exactly as expected by SymptomChecker.jsx
    return res.status(200).json(rankedResults);

  } catch (error) {
    console.error("Error processing symptoms check:", error);
    next(error);
  }
};
