export const UNDEFINED_ID = -1;

export class DocumentHeader {
  id: number;
  title: string;

  constructor(title: string) {
    this.id = UNDEFINED_ID;
    this.title = title;
  }
}

export class PlainTextDocument {
  constructor(public header: DocumentHeader, public text: string) {
  }
}

export function createDefaultDocuments(): Array<PlainTextDocument> {
  return [
    createBlankDocument(),
    new PlainTextDocument(
      new DocumentHeader('Esimerkki 1'),
`Vanha vaka Väinämöinen,
laulaja iän-aikainen,
itse laululle rupesi,
töille virtten työntelihe.`
    ),
    new PlainTextDocument(
      new DocumentHeader('Esimerkki 2'),
`Joko teen tikasta virren,
pakinan tikan pojasta?
Paljo on tikalla huolta
ja paljo tikan pojalla
syömisestä, juomisesta,
henkensä pitämisestä.`
    )
  ];
}

export function createBlankDocument(): PlainTextDocument {
  return new PlainTextDocument(new DocumentHeader('Nimetön teksti'), '');
}