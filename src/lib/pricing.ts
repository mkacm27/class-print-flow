interface IPriceSettings {
  priceRecto: number;
  priceRectoVerso: number;
}

interface ICalculatePriceParams {
  printType: "Recto" | "Recto-verso" | "Both";
  pages: number;
  rectoPages?: number;
  rectoVersoPages?: number;
  copies: number;
  settings: IPriceSettings;
}

export const calculatePrice = ({
  printType,
  pages,
  rectoPages = 0,
  rectoVersoPages = 0,
  copies,
  settings,
}: ICalculatePriceParams): number => {
  let totalPrice = 0;

  if (printType === "Both") {
    totalPrice =
      (rectoPages * settings.priceRecto +
        rectoVersoPages * settings.priceRectoVerso) *
      copies;
  } else {
    let pricePerPage = 0;
    switch (printType) {
      case "Recto":
        pricePerPage = settings.priceRecto;
        break;
      case "Recto-verso":
        pricePerPage = settings.priceRectoVerso;
        break;
    }
    totalPrice = pages * pricePerPage * copies;
  }

  // Return the raw price. Formatting (like toFixed) should be done in the UI layer.
  return totalPrice;
};
