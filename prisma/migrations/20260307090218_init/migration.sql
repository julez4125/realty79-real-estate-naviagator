-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "source" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "ort" TEXT NOT NULL,
    "plz" TEXT NOT NULL,
    "strasse" TEXT,
    "bundesland" TEXT,
    "wohnflaeche" DOUBLE PRECISION NOT NULL,
    "grundstueck" DOUBLE PRECISION,
    "zimmer" DOUBLE PRECISION NOT NULL,
    "baujahr" INTEGER,
    "wohnungstyp" TEXT,
    "objektzustand" TEXT,
    "heizung" TEXT,
    "energieausweis" TEXT,
    "kaufpreis" DOUBLE PRECISION NOT NULL,
    "preisProQm" DOUBLE PRECISION NOT NULL,
    "hausgeld" DOUBLE PRECISION,
    "grundsteuer" DOUBLE PRECISION,
    "kaltmieteIst" DOUBLE PRECISION,
    "kaltmieteSoll" DOUBLE PRECISION,
    "roiSoll" DOUBLE PRECISION,
    "roiIst" DOUBLE PRECISION,
    "cashflowIM" DOUBLE PRECISION,
    "marktwert" DOUBLE PRECISION,
    "preisAbweichung" DOUBLE PRECISION,
    "trend" TEXT,
    "bodenrichtwert" DOUBLE PRECISION,
    "phase" INTEGER NOT NULL DEFAULT 1,
    "phase1Passed" BOOLEAN,
    "phase2Passed" BOOLEAN,
    "phase3Passed" BOOLEAN,
    "score" DOUBLE PRECISION,
    "recommendation" TEXT,
    "isNew" BOOLEAN NOT NULL DEFAULT true,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "isOwned" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "searchId" TEXT,
    "portfolioId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analysis" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "kaufnebenkosten" DOUBLE PRECISION NOT NULL,
    "gesamtinvestition" DOUBLE PRECISION NOT NULL,
    "eigenkapital" DOUBLE PRECISION NOT NULL,
    "bruttomietrendite" DOUBLE PRECISION NOT NULL,
    "nettomietrendite" DOUBLE PRECISION NOT NULL,
    "kaufpreisfaktor" DOUBLE PRECISION NOT NULL,
    "eigenkapitalrendite" DOUBLE PRECISION NOT NULL,
    "cashflowOperativ" DOUBLE PRECISION NOT NULL,
    "cashflowNachSteuern" DOUBLE PRECISION NOT NULL,
    "breakEvenJahr" INTEGER,
    "breakEvenKumCf" INTEGER,
    "darlehensSumme" DOUBLE PRECISION NOT NULL,
    "zinsenMonat" DOUBLE PRECISION NOT NULL,
    "tilgungMonat" DOUBLE PRECISION NOT NULL,
    "restschuldJahr10" DOUBLE PRECISION,
    "volltilgungJahr" INTEGER,
    "vermoegenszuwachs" DOUBLE PRECISION,
    "beleihungsreserve" DOUBLE PRECISION,
    "cashflowProjektion" JSONB NOT NULL,
    "annahmen" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeepResearch" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "zustandScore" DOUBLE PRECISION,
    "renovierungsbedarf" TEXT,
    "sanierungskosten" DOUBLE PRECISION,
    "erkannteProbleme" JSONB,
    "lageScore" DOUBLE PRECISION,
    "infrastruktur" JSONB,
    "oepnvScore" DOUBLE PRECISION,
    "einkaufScore" DOUBLE PRECISION,
    "bevoelkerungstrend" TEXT,
    "wirtschaftskraft" TEXT,
    "arbeitslosenquote" DOUBLE PRECISION,
    "miettrend5Jahre" DOUBLE PRECISION,
    "hochwasserRisiko" TEXT,
    "laermPegel" DOUBLE PRECISION,
    "solarPotenzial" DOUBLE PRECISION,
    "risikoScore" DOUBLE PRECISION,
    "risikoDetails" JSONB,
    "aiAnalyse" TEXT,
    "aiEmpfehlung" TEXT,
    "angebotspreis" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeepResearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyPhoto" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "kategorie" TEXT,
    "aiAnalysis" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scenario" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "params" JSONB NOT NULL,
    "ergebnis" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Scenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "bezeichnung" TEXT NOT NULL,
    "typ" TEXT NOT NULL,
    "flaeche" DOUBLE PRECISION,
    "zimmer" DOUBLE PRECISION,
    "stockwerk" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Renter" (
    "id" TEXT NOT NULL,
    "vorname" TEXT NOT NULL,
    "nachname" TEXT NOT NULL,
    "email" TEXT,
    "telefon" TEXT,
    "whatsapp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Renter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lease" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "renterId" TEXT NOT NULL,
    "beginn" TIMESTAMP(3) NOT NULL,
    "ende" TIMESTAMP(3),
    "kuendigungsfrist" INTEGER NOT NULL DEFAULT 3,
    "kaltmiete" DOUBLE PRECISION NOT NULL,
    "nebenkosten" DOUBLE PRECISION NOT NULL,
    "heizkosten" DOUBLE PRECISION,
    "stellplatzMiete" DOUBLE PRECISION,
    "gesamtmiete" DOUBLE PRECISION NOT NULL,
    "staffelmiete" JSONB,
    "indexmiete" BOOLEAN NOT NULL DEFAULT false,
    "kaution" DOUBLE PRECISION,
    "kautionBezahlt" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'aktiv',
    "kuendigungAm" TIMESTAMP(3),
    "kuendigungVon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lease_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "leaseId" TEXT NOT NULL,
    "monat" TIMESTAMP(3) NOT NULL,
    "sollBetrag" DOUBLE PRECISION NOT NULL,
    "istBetrag" DOUBLE PRECISION,
    "eingangAm" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'offen',
    "mahnStufe" INTEGER NOT NULL DEFAULT 0,
    "notiz" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "kategorie" TEXT NOT NULL,
    "beschreibung" TEXT NOT NULL,
    "betrag" DOUBLE PRECISION NOT NULL,
    "datum" TIMESTAMP(3) NOT NULL,
    "umlagefaehig" BOOLEAN NOT NULL DEFAULT false,
    "belegPfad" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meter" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "typ" TEXT NOT NULL,
    "zaehlerNr" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Meter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeterReading" (
    "id" TEXT NOT NULL,
    "meterId" TEXT NOT NULL,
    "datum" TIMESTAMP(3) NOT NULL,
    "wert" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MeterReading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceTask" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "titel" TEXT NOT NULL,
    "beschreibung" TEXT,
    "typ" TEXT NOT NULL,
    "prioritaet" TEXT NOT NULL DEFAULT 'normal',
    "status" TEXT NOT NULL DEFAULT 'offen',
    "faelligAm" TIMESTAMP(3),
    "wiederholung" TEXT,
    "kosten" DOUBLE PRECISION,
    "handwerkerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceTicket" (
    "id" TEXT NOT NULL,
    "taskId" TEXT,
    "renterId" TEXT,
    "beschreibung" TEXT NOT NULL,
    "fotos" JSONB,
    "status" TEXT NOT NULL DEFAULT 'neu',
    "aiSummary" TEXT,
    "aiPrioritaet" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Handwerker" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gewerk" TEXT NOT NULL,
    "telefon" TEXT,
    "email" TEXT,
    "bewertung" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Handwerker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RenterConversation" (
    "id" TEXT NOT NULL,
    "renterId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "externalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RenterConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RenterMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "metadata" JSONB,
    "needsReview" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RenterMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentConversation" (
    "id" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "externalChatId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT,
    "leaseId" TEXT,
    "name" TEXT NOT NULL,
    "typ" TEXT NOT NULL,
    "kategorie" TEXT NOT NULL,
    "pfad" TEXT NOT NULL,
    "generiert" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "typ" TEXT NOT NULL,
    "inhalt" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Portfolio" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Mein Portfolio',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Portfolio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PipelineConfig" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'default',
    "p1MinRendite" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "p1MaxFaktor" DOUBLE PRECISION NOT NULL DEFAULT 20.0,
    "p1MinCashflow" DOUBLE PRECISION NOT NULL DEFAULT -200.0,
    "p1MaxPreisProQm" DOUBLE PRECISION NOT NULL DEFAULT 4000.0,
    "p1MinBaujahr" INTEGER NOT NULL DEFAULT 1980,
    "p1MinWohnflaeche" DOUBLE PRECISION NOT NULL DEFAULT 40.0,
    "p1Logic" TEXT NOT NULL DEFAULT 'ALL',
    "p2MinCfNachSt" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "p2MinEkRendite" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "p2MaxBreakEven" INTEGER NOT NULL DEFAULT 10,
    "p2MinMietpotenzial" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "p2MinNettoRendite" DOUBLE PRECISION NOT NULL DEFAULT 3.0,
    "eigenkapitalQ" DOUBLE PRECISION NOT NULL DEFAULT 0.20,
    "zinssatz" DOUBLE PRECISION NOT NULL DEFAULT 0.03,
    "tilgung" DOUBLE PRECISION NOT NULL DEFAULT 0.02,
    "mietsteigerung" DOUBLE PRECISION NOT NULL DEFAULT 0.03,
    "kostensteigerung" DOUBLE PRECISION NOT NULL DEFAULT 0.02,
    "wertsteigerung" DOUBLE PRECISION NOT NULL DEFAULT 0.02,
    "grenzsteuersatz" DOUBLE PRECISION NOT NULL DEFAULT 0.42,
    "afaSatz" DOUBLE PRECISION NOT NULL DEFAULT 0.02,
    "gebaeudeAnteil" DOUBLE PRECISION NOT NULL DEFAULT 0.75,
    "instandhaltung" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "mietausfall" DOUBLE PRECISION NOT NULL DEFAULT 0.03,
    "makler" DOUBLE PRECISION NOT NULL DEFAULT 0.0357,
    "notar" DOUBLE PRECISION NOT NULL DEFAULT 0.015,
    "grundbuch" DOUBLE PRECISION NOT NULL DEFAULT 0.005,
    "grunderwerbst" DOUBLE PRECISION NOT NULL DEFAULT 0.05,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PipelineConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedSearch" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "immoMetricaId" TEXT,
    "filters" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastScraped" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedSearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScrapeLog" (
    "id" TEXT NOT NULL,
    "searchId" TEXT,
    "status" TEXT NOT NULL,
    "propertiesFound" INTEGER NOT NULL DEFAULT 0,
    "newProperties" INTEGER NOT NULL DEFAULT 0,
    "phase1Passed" INTEGER NOT NULL DEFAULT 0,
    "phase2Passed" INTEGER NOT NULL DEFAULT 0,
    "phase3Passed" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScrapeLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Property_externalId_key" ON "Property"("externalId");

-- CreateIndex
CREATE INDEX "Property_plz_idx" ON "Property"("plz");

-- CreateIndex
CREATE INDEX "Property_phase_idx" ON "Property"("phase");

-- CreateIndex
CREATE INDEX "Property_score_idx" ON "Property"("score");

-- CreateIndex
CREATE INDEX "Property_isNew_idx" ON "Property"("isNew");

-- CreateIndex
CREATE INDEX "Property_isFavorite_idx" ON "Property"("isFavorite");

-- CreateIndex
CREATE UNIQUE INDEX "Analysis_propertyId_key" ON "Analysis"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "DeepResearch_propertyId_key" ON "DeepResearch"("propertyId");

-- CreateIndex
CREATE INDEX "Lease_status_idx" ON "Lease"("status");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_monat_idx" ON "Payment"("monat");

-- CreateIndex
CREATE INDEX "Expense_propertyId_datum_idx" ON "Expense"("propertyId", "datum");

-- CreateIndex
CREATE INDEX "MaintenanceTask_status_idx" ON "MaintenanceTask"("status");

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_searchId_fkey" FOREIGN KEY ("searchId") REFERENCES "SavedSearch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analysis" ADD CONSTRAINT "Analysis_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeepResearch" ADD CONSTRAINT "DeepResearch_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyPhoto" ADD CONSTRAINT "PropertyPhoto_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scenario" ADD CONSTRAINT "Scenario_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lease" ADD CONSTRAINT "Lease_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lease" ADD CONSTRAINT "Lease_renterId_fkey" FOREIGN KEY ("renterId") REFERENCES "Renter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "Lease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meter" ADD CONSTRAINT "Meter_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeterReading" ADD CONSTRAINT "MeterReading_meterId_fkey" FOREIGN KEY ("meterId") REFERENCES "Meter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceTask" ADD CONSTRAINT "MaintenanceTask_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceTask" ADD CONSTRAINT "MaintenanceTask_handwerkerId_fkey" FOREIGN KEY ("handwerkerId") REFERENCES "Handwerker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceTicket" ADD CONSTRAINT "MaintenanceTicket_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "MaintenanceTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceTicket" ADD CONSTRAINT "MaintenanceTicket_renterId_fkey" FOREIGN KEY ("renterId") REFERENCES "Renter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RenterConversation" ADD CONSTRAINT "RenterConversation_renterId_fkey" FOREIGN KEY ("renterId") REFERENCES "Renter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RenterMessage" ADD CONSTRAINT "RenterMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "RenterConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentMessage" ADD CONSTRAINT "AgentMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AgentConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "Lease"("id") ON DELETE CASCADE ON UPDATE CASCADE;
