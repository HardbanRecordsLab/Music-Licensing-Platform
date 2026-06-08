import { Invoice } from "../types.js";
import { X, Printer, Download, CheckCircle } from "lucide-react";

interface InvoiceModalProps {
  invoice: Invoice;
  onClose: () => void;
}

export function InvoiceModal({ invoice, onClose }: InvoiceModalProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-fade-in backdrop-blur-sm">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white text-gray-800 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header panel */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-red-100 p-1 text-red-600">
              <CheckCircle className="h-5 w-5" />
            </span>
            <h2 className="text-lg font-bold text-gray-900 font-sans">Podgląd Faktury Sliced Invoices v2.0</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition"
              title="Drukuj"
            >
              <Printer className="h-4 w-4" />
              <span>Drukuj</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable View */}
        <div className="flex-1 overflow-y-auto p-8 id-printable" id="printable-area">
          {/* Logo i Nagłówek spółki */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b pb-8 border-gray-200">
            <div>
              <div className="font-sans font-black text-3xl tracking-widest text-red-600 mb-2">HRL</div>
              <p className="text-xs text-gray-500 font-mono">Hardban Records Lab</p>
              <p className="text-sm text-gray-600 mt-2">
                ul. Bracka 12/4<br />
                00-502 Warszawa<br />
                NIP: PL5251234567
              </p>
            </div>
            
            <div className="text-right sm:text-right">
              <h1 className="text-2xl font-black text-gray-900 font-sans mb-1">FAKTURA VAT</h1>
              <p className="font-mono text-sm text-red-600 font-semibold">{invoice.invoiceNumber}</p>
              
              <div className="mt-4 text-xs text-gray-500 space-y-1">
                <p>Data wystawienia: <span className="text-gray-700 font-medium font-mono">{invoice.date}</span></p>
                <p>Data sprzedaży: <span className="text-gray-700 font-medium font-mono">{invoice.date}</span></p>
                <p>Termin płatności: <span className="text-gray-700 font-medium font-mono">{invoice.date}</span></p>
                <p>Metoda płatności: <span className="bg-green-100 text-green-800 font-semibold px-1.5 py-0.5 rounded font-mono">Stripe B2B (Cykliczna)</span></p>
              </div>
            </div>
          </div>

          {/* Strony transakcji */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8 pb-6 border-b border-gray-100">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 font-mono">SPRZEDAWCA:</p>
              <p className="font-bold text-gray-900">Hardban Records Lab</p>
              <p className="text-sm text-gray-600 mt-1">
                Licencjonowanie Muzyki B2B Zwolnione z Opłat ZAiKS/STOART<br />
                E-mail: contact@hardbanrecordslab.online<br />
                Konto: PL 12 1020 1010 0000 9001 0202 0303
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 font-mono">NABYWCA (KLIENT):</p>
              <p className="font-bold text-gray-900">{invoice.clientName}</p>
              <p className="text-sm text-gray-600 mt-1">
                Poziom subskrypcji (Id) <br />
                E-mail: {invoice.clientEmail}
              </p>
            </div>
          </div>

          {/* Pozycje faktury */}
          <table className="w-full text-left text-sm mb-8">
            <thead>
              <tr className="border-b border-gray-300 text-xs font-bold uppercase tracking-wider text-gray-400 font-mono">
                <th className="py-3">Nazwa usługi / Opis</th>
                <th className="py-3 text-center">Ilość</th>
                <th className="py-3 text-right">Cena PLN</th>
                <th className="py-3 text-right">VAT%</th>
                <th className="py-3 text-right">Wartość Brutto</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, idx) => {
                const gross = item.amount;
                const net = parseFloat((gross / 1.23).toFixed(2));
                return (
                  <tr key={idx} className="border-b border-gray-100 text-gray-700">
                    <td className="py-4 font-medium">{item.description}</td>
                    <td className="py-4 text-center font-mono">{item.qty}</td>
                    <td className="py-4 text-right font-mono">{net.toFixed(2)} PLN</td>
                    <td className="py-4 text-right font-mono">23%</td>
                    <td className="py-4 text-right font-mono font-semibold">{gross.toFixed(2)} PLN</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Podsumowanie podatkowe oraz kwoty */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 bg-gray-50 p-5 rounded-xl">
            <div className="text-xs text-gray-500 space-y-1">
              <p className="font-semibold text-gray-700 font-sans">Status prawny licencji:</p>
              <p>Właściciel wytwórni HRL posiada 100% praw autorskich do nagrań.</p>
              <p>Niniejsza licencja upoważnia nabywcę do publicznego odtwarzania w lokalu.</p>
              <p>Muzyka jest wolna od opłat na rzecz organizacji zbiorowego zarządzania OZZ.</p>
            </div>
            
            <div className="w-full sm:w-64 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Suma Netto:</span>
                <span className="font-mono">{(invoice.total - invoice.tax).toFixed(2)} PLN</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Podatek VAT 23%:</span>
                <span className="font-mono">{invoice.tax.toFixed(2)} PLN</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 text-lg font-bold text-gray-900 font-sans">
                <span>Razem BRUTTO:</span>
                <span className="font-mono text-red-600">{invoice.total.toFixed(2)} PLN</span>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center text-xs text-gray-400 font-mono">
            Faktura wygenerowana automatycznie przez Sliced Invoices przy integracji z bramką płatności Stripe.
          </div>
        </div>
      </div>
    </div>
  );
}
