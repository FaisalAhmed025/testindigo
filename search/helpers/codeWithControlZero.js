import Airline from "../../models/airlines";

export async function getCodeWithControlZero() {
  try {
    const results = await Airline.findAll({
      attributes: ["code"],
      where: {
        control: 0,
      },
    });

    // Extract the codes from the results
    const codesWithControlZero = results.map((item) =>
      item.get({ plain: true })
    );

    return codesWithControlZero;
  } catch (error) {
    console.error("Error retrieving codes with control 0:", error);
    throw error;
  }
}
