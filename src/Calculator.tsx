import Buttons from "./components/Buttons";
import Input from "./components/Input";
import { Operators } from "./types/operations";
import { useMemo, useState } from "react";
import "./styles.css";

const operations: Operators = {
  "+": (n1, n2) => n1 + n2,
  "-": (n1, n2) => n1 - n2,
  "*": (n1, n2) => n1 * n2,
  "/": (n1, n2) => n1 / n2,
  "%": (_n1, n2) => n2 / 100,
  "+/-": (_n1, n2) => n2 * -1,
};

export default function Calculator() {
  const [input, setInput] = useState<string | null>(null);
  const [oldInput, setOldInput] = useState<string | null>(null);
  const [showOldInput, setShowOldInput] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);
  const [prevSymbol, setPrevSymbol] = useState<string | null>(null);
  const [hasError, setHasError] = useState<boolean>(false)
  const [equalSignPressed, setEqualSignPressed] = useState<boolean>(false) 

  const currentInput: string | null = useMemo<string | null>(
    () => (showOldInput ? oldInput : input),
    [input, showOldInput]
  );

  function clear() {
    setInput(null);
    setOldInput(null);
    setShowOldInput(false);
    setTotal(0);
    setPrevSymbol(null);
    setHasError(false)
  }

  function calculate(
    buffer: number,
    currentTotal: number,
    symbol: string
  ): number {
    return operations[symbol](currentTotal, buffer);
  }

  function handleSymbol(symbol: string) {
    switch (symbol) {
      case "C":
        clear();
        break;
      case "=":
        setEqualSignPressed(true)
        if (input === null || prevSymbol === null) return;
        const finalTotal: number = calculate(
          parseFloat(input),
          total,
          prevSymbol
        );
        if(input === '0' && prevSymbol === '/'){
          setHasError(true)
          return
        }
        setInput(finalTotal.toString());
        setPrevSymbol(null);
        if (showOldInput) setShowOldInput(false);
        break;

      case "%":
      case "+/-":
        if (input === null) {
          return;
        }
        const changedValue: number = calculate(
          parseFloat(input),
          total,
          symbol
        );
        setInput(changedValue.toString());
        break;

      case ".":
        if (!input?.includes(".")) {
          storeNumToScreen(symbol);
        }
        break;

      case "+":
      case "-":
      case "*":
      case "/":
        if (input === null || prevSymbol === null) {
          if (prevSymbol === null) {
            if (input !== null) setTotal(parseFloat(input));
            prepareNextOperation(symbol);
          }
          return;
        }
        const newTotal: number = calculate(
          parseFloat(input),
          total,
          prevSymbol
        );
        setTotal(newTotal);
        prepareNextOperation(symbol);
        break;

      default:
        break;
    }
  }

  function prepareNextOperation(symbol: string) {
    setPrevSymbol(symbol);
    setShowOldInput(true);
    setOldInput(input);
    setInput(null);
  }

  function storeNumToScreen(num: string) {
    setInput(prev => prev === '0' || prev === null || equalSignPressed? num : prev + num)
    
  }

  function handleButtonPress(value: string) {
    if (showOldInput) {
      setShowOldInput(false);
    }
    const numValue: number = parseInt(value);
    if (Number.isNaN(numValue)) {
      handleSymbol(value);
    } else {
      storeNumToScreen(value);
      if(equalSignPressed){
        setTotal(0)
      } 
    }
    if(value !== '='){
      setEqualSignPressed((value === '+/-' || value === '%' || value === '.'))
    }
  }

  return (
    <div className="calculator-container">
      <Input error={hasError} input={currentInput ?? "0"} />
      <Buttons handleOnPress={handleButtonPress} />
    </div>
  );
}
