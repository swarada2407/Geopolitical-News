import mongoose from "mongoose";

const militaryCountrySchema = new mongoose.Schema(
  {
    code: String,
    country: String,
    region: String,
    strategicRegion: String,
    group: [String],

    tanks: Number,
    armoredVehicles: Number,
    fighterJets: Number,
    helicopters: Number,
    warships: Number,
    submarines: Number,
    artillery: Number,

    activePersonnel: Number,
    reservePersonnel: Number,
    defenseBudget: Number,
    gdp: Number,

    airPowerScore: Number,
    navalPowerScore: Number,
    landPowerScore: Number,

    strategicNotes: String,
  },
  { timestamps: true }
);

export default mongoose.model("MilitaryCountry", militaryCountrySchema);