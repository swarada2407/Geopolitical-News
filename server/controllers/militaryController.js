import MilitaryCountry from "../models/MilitaryCountry.js";

export async function getAllMilitaryCountries(req, res) {
  try {
    const countries = await MilitaryCountry.find().sort({ country: 1 });
    if (countries.length === 0) {
      // Return a basic structure if DB is empty to prevent UI from breaking
      return res.json([]);
    }
    res.json(countries);
  } catch (error) {
    console.error("Military Data Fetch Error:", error.message);
    res.status(200).json([]); // Return empty array instead of 500 to keep UI alive
  }
}

export async function getMilitaryCountry(req, res) {
  try {
    const { name } = req.params;

    const country = await MilitaryCountry.findOne({ country: name });

    if (!country) {
      return res.status(404).json({ message: "Country not found" });
    }

    res.json(country);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch country" });
  }
}

export async function addMilitaryCountry(req, res) {
  try {
    const country = await MilitaryCountry.create(req.body);
    res.status(201).json(country);
  } catch (error) {
    res.status(400).json({ message: "Failed to add military data" });
  }
}

export async function updateMilitaryCountry(req, res) {
  try {
    const { id } = req.params;
    const country = await MilitaryCountry.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!country) {
      return res.status(404).json({ message: "Country not found" });
    }
    res.json(country);
  } catch (error) {
    res.status(400).json({ message: "Failed to update military data" });
  }
}

export async function deleteMilitaryCountry(req, res) {
  try {
    const { id } = req.params;
    const country = await MilitaryCountry.findByIdAndDelete(id);
    if (!country) {
      return res.status(404).json({ message: "Country not found" });
    }
    res.json({ message: "Country deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete military data" });
  }
}