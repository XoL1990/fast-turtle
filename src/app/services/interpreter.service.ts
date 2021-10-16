import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export enum Command {
  forward,
  backward,
  turnleft,
  turnright,
  direction,
  center,
  go,
  gox,
  goy,
  penup,
  pendown,
  penwidth,
  pencolor,
  speed,
  // testing only xD - sorry for politics
  test
}

export interface Line {
  hasError: boolean;
  text: string;
}

export class ParsedLine {
  public command: Command;
  public params: number[];

  constructor(line: string[]) {
    this.command = Command[line[0].toLowerCase() as keyof typeof Command];
    this.params = line.filter((v, i) => i > 0).map(v => Number(v));
  }

  public compare(line: ParsedLine) {
    if (this.command !== line.command) return false;
    if (this.params.length !== line.params.length) return false;
    
    for (let i = 0; i < this.params.length; i++) {
      if (this.params[i] !== line.params[i]) return false;
    }

    return true;
  }
}

@Injectable({
  providedIn: 'root'
})
export class InterpreterService {

  private linesData = new BehaviorSubject<Line[]>([]);

  constructor() { }

  updateLines(text: string) {
    const textLines = text.split("\n");
    const lines = textLines.map(line => ({hasError: false, text: line}));
    this.linesData.next(lines);
  }

  getLinesObservable() {
    return this.linesData.asObservable();
  }

  getValidLines() {
    const lines = this.linesData.getValue();

    if (lines.length === 0) {
      return null;
    }

    const notEmpty = lines.filter(line => !!line.text);
    const formatted = notEmpty.map(line => this.parseLine(line.text));

    const { valid, invalidLineIndexes } = this.validate(formatted);

    if (!valid) {
      // here should be new data with changes or modified old data for speed?
      // modification can not occurs :)
      // remember and be careful
      for (let index of invalidLineIndexes) {
        notEmpty[index].hasError = true;
      }
      return null;
    }

    return formatted.map(line => new ParsedLine(line));
  }

  private validate(lines: string[][]) {
    const commands = Object.keys(Command).filter(v => isNaN(Number(v)) === true);
    let valid = true;
    const invalidLineIndexes: number[] = [];
    let index = 0;
    for (const line of lines) {
      const command = line[0].toLowerCase();
      if (!command || commands.indexOf(command.toLowerCase()) === -1) {
        valid = false;
        invalidLineIndexes.push(index);
      }
      else {
        let paramsCount = 1;
        switch (command) {
          case Command[Command.pencolor]:
            paramsCount = 3;
            break;
          case Command[Command.go]:
            paramsCount = 2;
            break;
          case Command[Command.center]:
          case Command[Command.penup]:
          case Command[Command.pendown]:
          case Command[Command.test]: // for tests
            paramsCount = 0;
            break;
        }
        if (paramsCount > 0) {
          if (!this.validateLine(line, paramsCount)) {
            valid = false;
            invalidLineIndexes.push(index);
          }
        }
      }
      index++;
    }
    return { valid, invalidLineIndexes };
  }

  private validateLine(params: string[], paramsCount: number) {
    for (let i = 1; i <= paramsCount; i++) {
      // return false if undefined or not number
      if (!params[i] || isNaN(Number(params[i]))) {
        return false;
      }
    }
    return true;
  }

  private parseLine(line: string) {
    const withoutComma = line.replace(new RegExp(',', 'g'), ' ');
    const withoutDoubledSpaces = withoutComma.replace(/\s\s+/g, ' ');
    return withoutDoubledSpaces.split(' ');
  }
}
