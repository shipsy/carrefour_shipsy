/* ============================================================
   Shipsy Admin Console — Seed Data
   Realistic Carrefour Belgium data per RFP / Q&A
   ============================================================ */

import type {
  Zone, AdminStore, SlotConfiguration, YieldConfiguration, Carrier,
  AllocationRule, SegmentDefinition, Holiday, SlotTemplateConfig,
  EmergencyOverride, ABExperiment, SystemConfig, AuditEntry,
  DayOfWeek, BusinessLine, SlotTemplate,
} from './types';

// ── Zones (Q&A #4: ~35 postal-code zones) ───────────────────

export const zones: Zone[] = [
  // Facility 4459 — LAD Waterloo Mt-St-Jean
  { id: 'z-brussels13', name: 'Brussels 1.3', type: 'postal_code', postalCodes: ['1000','1005','1006','1007','1008','1009','1011','1012','1033','1035','1040','1041','1043','1044','1046','1047','1048','1049','1050','1060','1070','1100','1105','1150','1160','1170','1180','1190','1200','1210','1212','1620'], storeIds: ['4459'], businessLines: ['LAD'], isActive: true },
  { id: 'z-waterloo', name: 'Waterloo', type: 'postal_code', postalCodes: ['1300','1301','1310','1320','1325','1330','1331','1332','1340','1341','1342','1348','1380','1390','1410','1435','1470','1490','1560','1630','1640','1652','1950','1970','3040','3051','3080','3090'], storeIds: ['4459'], businessLines: ['LAD'], isActive: true },
  { id: 'z-nivellestubize', name: 'Nivelles-Tubize', type: 'postal_code', postalCodes: ['1400','1401','1402','1404','1420','1421','1428','1440','1450','1460','1461','1471','1472','1473','1474','1476','1480','1495','1500','1501','1502','1601','1650','1651','1653','1654','1674'], storeIds: ['4459'], businessLines: ['LAD'], isActive: true },
  { id: 'z-mons', name: 'Mons', type: 'postal_code', postalCodes: ['7000','7010','7020','7021','7022','7030','7031','7032','7034','7041','7060','7061','7062','7063','7070','7090','7100','7110','7120','7130','7131','7133','7134','7140','7141','7160','7170','7180','7181','7190','7191','7510','7511','7512'], storeIds: ['4459'], businessLines: ['LAD'], isActive: true },
  { id: 'z-mons2', name: 'Mons 2', type: 'postal_code', postalCodes: ['7011','7012','7024','7033','7040','7050','7080','7300','7301','7320','7330','7331','7332','7333','7334','7340','7350','7370','7380','7382','7387','7390','7513'], storeIds: ['4459'], businessLines: ['LAD'], isActive: true },
  { id: 'z-mouscron', name: 'Mouscron', type: 'postal_code', postalCodes: ['7500','7501','7502','7503','7504','7506','7520','7521','7522','7530','7531','7532','7533','7534','7536','7538','7540','7542','7543','7548','7700','7711','7712','7730','7740','7742','7743','7750','7760','7812','7900','7901','7903','7904','7906','7910','7911','7912','7970','7971','7972','7973','9600'], storeIds: ['4459'], businessLines: ['LAD'], isActive: true },
  { id: 'z-hainaut', name: 'Hainaut', type: 'postal_code', postalCodes: ['7800','7801','7802','7803','7804','7810','7811','7822','7823','7862','7863','7870','7880','7890','7940','7941','7942','7943','7950','7951','9570','9571','9572','9661'], storeIds: ['4459'], businessLines: ['LAD'], isActive: true },
  { id: 'z-hainaut1', name: 'Hainaut 1', type: 'postal_code', postalCodes: ['1430','1540','1541','1547','1570','1600','1602','1670','1671','1673','1750','1755','1760','7830','7850','7860','7861','7864','7866','9400','9401','9402','9403','9500','9506'], storeIds: ['4459'], businessLines: ['LAD'], isActive: true },
  { id: 'z-tournai', name: 'Tournai', type: 'postal_code', postalCodes: ['7601','7602','7603','7604','7608','7610','7611','7618','7622','7640','7641','7642','7643'], storeIds: ['4459'], businessLines: ['LAD'], isActive: true },
  // Facility 4660 — LAD Borsbeek
  { id: 'z-antwerp-1', name: 'Antwerp -1', type: 'postal_code', postalCodes: ['1733','2000','2018','2020','2060','2099','2140','2600','3900'], storeIds: ['4660'], businessLines: ['LAD'], isActive: true },
  { id: 'z-antwerp0', name: 'Antwerp 0', type: 'postal_code', postalCodes: ['2920','2930','2940','2950','2960','2990','9130'], storeIds: ['4660'], businessLines: ['LAD'], isActive: true },
  { id: 'z-antwerp1', name: 'Antwerp 1', type: 'postal_code', postalCodes: ['2100','2110','2150','2160','2170','2240','2520','2530','2531','2540','2610','2640','2650','2660','2900','2970','2980'], storeIds: ['4660'], businessLines: ['LAD'], isActive: true },
  { id: 'z-antwerp2', name: 'Antwerp 2', type: 'postal_code', postalCodes: ['1840','1880','2030','2050','2180','2220','2221','2222','2223','2270','2500','2547','2550','2560','2570','2580','2590','2620','2627','2630','2800','2801','2811','2812','2820','2830','2840','2845','2850','2860','2861','2870','2880','2890','3190','3191','9150','9255'], storeIds: ['4660'], businessLines: ['LAD'], isActive: true },
  { id: 'z-bruges', name: 'Bruges', type: 'postal_code', postalCodes: ['8000','8200','8210','8310','8340','8377','8380','8490','9992'], storeIds: ['4660'], businessLines: ['LAD'], isActive: true },
  { id: 'z-brussels1', name: 'Brussels 1', type: 'postal_code', postalCodes: ['1701','1703','1730','1740','1741','1742','1745','1761','1770','1790','9300','9310','9320','9404','9406','9450','9451','9470','9472','9473'], storeIds: ['4660'], businessLines: ['LAD'], isActive: true },
  { id: 'z-brussels2', name: 'Brussels 2', type: 'postal_code', postalCodes: ['1785','1800','1804','1820','1830','1831','1850','1851','1852','1860','1861','1930','1931','1933','1934','1935','1980'], storeIds: ['4660'], businessLines: ['LAD'], isActive: true },
  { id: 'z-brussels3', name: 'Brussels 3', type: 'postal_code', postalCodes: ['1020','1030','1031','1080','1081','1082','1083','1090','1099','1101','1110','1120','1130','1140','1700','1702','1731','1780','1818','1853','1932'], storeIds: ['4660'], businessLines: ['LAD'], isActive: true },
  { id: 'z-ghent1', name: 'Ghent 1', type: 'postal_code', postalCodes: ['8730','9060','9185','9850','9880','9881','9900','9910','9930','9931','9932','9940','9950','9960','9961','9968','9970','9971','9980','9981','9982','9988','9990','9991'], storeIds: ['4660'], businessLines: ['LAD'], isActive: true },
  { id: 'z-ghent3', name: 'Ghent 3', type: 'postal_code', postalCodes: ['9000','9030','9031','9032','9040','9041','9042','9050','9051','9052','9070','9075','9080','9090','9099','9230','9270','9340','9520','9521','9920','9921'], storeIds: ['4660'], businessLines: ['LAD'], isActive: true },
  { id: 'z-kortrijk', name: 'Kortrijk', type: 'postal_code', postalCodes: ['8020','8500','8501','8510','8520','8530','8540','8550','8560','8570','8580','8700','8710','8720','8740','8750','8760','8770','8780','8790','8800','8810','8820','8830','8840','8850','8860','8870','8880','8890','8930','8940','8980','9870'], storeIds: ['4660'], businessLines: ['LAD'], isActive: true },
  { id: 'z-kortrijk1', name: 'Kortrijk 1', type: 'postal_code', postalCodes: ['8572','8581','9200','9240','9260','9280','9290','9308','9420','9550','9551','9552','9620','9630','9636','9660','9667','9680','9681','9688','9690','9700','9750','9770','9771','9772','9790','9800','9810','9820','9830','9831','9840','9860','9890'], storeIds: ['4660'], businessLines: ['LAD'], isActive: true },
  { id: 'z-kortrijk3', name: 'Kortrijk 3', type: 'postal_code', postalCodes: ['7780','7781','7782','7784','8640','8650','8691','8900','8902','8904','8906','8908','8920','8950','8951','8952','8953','8954','8956','8957','8958','8970','8972','8978'], storeIds: ['4660'], businessLines: ['LAD'], isActive: true },
  { id: 'z-leuven', name: 'Leuven', type: 'postal_code', postalCodes: ['1910','1981','1982','2235','3000','3001','3010','3012','3018','3020','3050','3052','3053','3054','3060','3061','3070','3071','3078','3110','3111','3118','3120','3128','3130','3140','3150','3200','3201','3202','3211','3212'], storeIds: ['4660'], businessLines: ['LAD'], isActive: true },
  { id: 'z-stniklaas', name: 'St-Niklaas', type: 'postal_code', postalCodes: ['2070','9100','9111','9112','9120','9140','9160','9170','9180','9190','9220','9250'], storeIds: ['4660'], businessLines: ['LAD'], isActive: true },
  { id: 'z-turnhout', name: 'Turnhout', type: 'postal_code', postalCodes: ['2200','2230','2242','2243','2250','2260','2275','2280','2288','2290','2300','2310','2320','2330','2340','2350','2360','2370','2380','2387','2390','2400','2430','2431','2440','2450','2460','2470','2480','2490','2491','3550','3580','3581','3583','3920','3940','3945','3970','3971'], storeIds: ['4660'], businessLines: ['LAD'], isActive: true },
  { id: 'z-westflanders', name: 'West Flanders', type: 'postal_code', postalCodes: ['8211','8300','8301','8370','8400','8420','8421','8450','8460','8480'], storeIds: ['4660'], businessLines: ['LAD'], isActive: true },
  { id: 'z-westflanders2', name: 'West Flanders 2', type: 'postal_code', postalCodes: ['8430','8431','8432','8433','8434','8470','8600','8620','8630','8660','8670','8680','8690'], storeIds: ['4660'], businessLines: ['LAD'], isActive: true },
  // Facility 4661 — LAD Herstal
  { id: 'z-charleroi', name: 'Charleroi', type: 'postal_code', postalCodes: ['5060','6000','6010','6020','6040','6041','6042','6043','6060','6061','6075','6099','6200','6210','6211','6220','6221','6222','6223','6224','6230','6238','6240','6250','6280'], storeIds: ['4661'], businessLines: ['LAD'], isActive: true },
  { id: 'z-charleroi2', name: 'Charleroi 2', type: 'postal_code', postalCodes: ['6001','6030','6031','6032','6044','6110','6111','6120','6140','6141','6142','6150','6180','6181','6182','6183'], storeIds: ['4661'], businessLines: ['LAD'], isActive: true },
  { id: 'z-eupen', name: 'Eupen', type: 'postal_code', postalCodes: ['3791','3792','3793','3798','4606','4607','4608','4650','4651','4652','4653','4654','4700','4701','4710','4711','4720','4721','4728','4730','4731','4800','4801','4802','4820','4821','4830','4831','4834','4837','4840','4841','4845','4850','4851','4852','4860','4861','4880','4890'], storeIds: ['4661'], businessLines: ['LAD'], isActive: true },
  { id: 'z-eupen2', name: 'Eupen 2', type: 'postal_code', postalCodes: ['4140','4141','4160','4161','4162','4163','4170','4171','4180','4181','4190','4560','4590','4750','4760','4761','4770','4771','4780','4782','4783','4784','4790','4791','4900','4910','4920','4950','4960','4970','4980','4983','4987','4990'], storeIds: ['4661'], businessLines: ['LAD'], isActive: true },
  { id: 'z-hasselt2', name: 'Hasselt 2', type: 'postal_code', postalCodes: ['1315','1350','1357','1360','1367','1370','1457','3300','3320','3321','3400','3401','3404','3500','3501','3511','3512','3520','3570','3590','3600','3620','3690','3700','3720','3721','3722','3723','3724','3730','3732','3740','3742','3746','3770','3800','3806','3830','3831','3832','3840','3870','3890','3891','4250','4252','4253','4254','4257','4280','4287','4300','4350','4351','4360'], storeIds: ['4661'], businessLines: ['LAD'], isActive: true },
  { id: 'z-hasselt22', name: 'Hasselt 2.2', type: 'postal_code', postalCodes: ['3210','3220','3221','3270','3271','3272','3290','3293','3294','3350','3360','3370','3380','3381','3384','3390','3391','3440','3450','3454','3460','3461','3470','3471','3472','3473','3510','3530','3540','3545','3560','3582','3803','3850'], storeIds: ['4661'], businessLines: ['LAD'], isActive: true },
  { id: 'z-liege2', name: 'Liege 2', type: 'postal_code', postalCodes: ['3717','4000','4020','4030','4031','4032','4040','4041','4042','4050','4051','4052','4053','4099','4100','4101','4102','4120','4121','4122','4130','4317','4340','4342','4347','4357','4367','4400','4420','4430','4431','4432','4450','4451','4452','4453','4458','4460','4470','4480','4530','4537','4540','4550','4557','4570','4577','4601','4602','4610','4620','4621','4623','4624','4630','4631','4632','4633','4670','4671','4672','4680','4681','4682','4683','4684','4690','4870','4877'], storeIds: ['4661'], businessLines: ['LAD'], isActive: true },
  { id: 'z-namur', name: 'Namur', type: 'postal_code', postalCodes: ['3790','4210','4217','4218','4219','4260','4261','4263','4500','4520','5000','5001','5002','5003','5004','5010','5012','5020','5021','5022','5024','5030','5031','5032','5070','5080','5081','5100','5101','5140','5150','5170','5190','5300','5310','5330','5332','5333','5334','5336','5340','5350','5351','5352','5353','5354','5380'], storeIds: ['4661'], businessLines: ['LAD'], isActive: true },
];

// ── Stores (3 LAD facilities from client data) ──────────────

export const stores: AdminStore[] = [
  // ── LAD Hubs ──────────────────────────────────────────────
  { id: '4459', name: 'LAD Waterloo Mt-St-Jean', type: 'LAD_Hub', address: 'Charleroi Road 579, 1410 Waterloo', postalCode: '1410', city: 'Waterloo', lat: 50.6935, lng: 4.3925, businessLines: ['LAD'], isActive: true, zoneIds: ['z-brussels13','z-waterloo','z-nivellestubize','z-mons','z-mons2','z-mouscron','z-hainaut','z-hainaut1','z-tournai'], maxDailyOrders: 450, operatingHours: { open: '05:00', close: '22:00' } },
  { id: '4660', name: 'LAD Borsbeek', type: 'LAD_Hub', address: 'Herentalsebaan 100, 2150 Borsbeek', postalCode: '2150', city: 'Borsbeek', lat: 51.1939, lng: 4.4870, businessLines: ['LAD'], isActive: true, zoneIds: ['z-antwerp-1','z-antwerp0','z-antwerp1','z-antwerp2','z-bruges','z-brussels1','z-brussels2','z-brussels3','z-ghent1','z-ghent3','z-kortrijk','z-kortrijk1','z-kortrijk3','z-leuven','z-stniklaas','z-turnhout','z-westflanders','z-westflanders2'], maxDailyOrders: 520, operatingHours: { open: '05:00', close: '22:00' } },
  { id: '4661', name: 'LAD Herstal', type: 'LAD_Hub', address: 'Rue Grande Foxhalle 75, 4040 Herstal', postalCode: '4040', city: 'Herstal', lat: 50.6667, lng: 5.6333, businessLines: ['LAD'], isActive: true, zoneIds: ['z-charleroi','z-charleroi2','z-eupen','z-eupen2','z-hasselt2','z-hasselt22','z-liege2','z-namur'], maxDailyOrders: 350, operatingHours: { open: '05:00', close: '22:00' } },
  // ── Hypermarkets ──────────────────────────────────────────
  { id: 'hyper-berchem', name: 'Carrefour Berchem-Ste-Agathe', type: 'Hypermarket', address: 'Avenue Charles Quint 560, 1082 Berchem-Ste-Agathe', postalCode: '1082', city: 'Berchem-Ste-Agathe', lat: 50.862, lng: 4.287, businessLines: ['Drive','FastDelivery'], isActive: true, zoneIds: ['z-brussels3'], maxDailyOrders: 200, operatingHours: { open: '08:00', close: '21:00' } },
  { id: 'hyper-evere', name: 'Carrefour Evere', type: 'Hypermarket', address: 'Avenue des Olympiades 12, 1140 Evere', postalCode: '1140', city: 'Evere', lat: 50.8694, lng: 4.3972, businessLines: ['Drive','FastDelivery'], isActive: true, zoneIds: ['z-brussels3'], maxDailyOrders: 180, operatingHours: { open: '08:00', close: '21:00' } },
  { id: 'hyper-auderghem', name: 'Carrefour Auderghem', type: 'Hypermarket', address: 'Boulevard du Souverain 240, 1160 Auderghem', postalCode: '1160', city: 'Auderghem', lat: 50.8105, lng: 4.4256, businessLines: ['Drive','FastDelivery'], isActive: true, zoneIds: ['z-brussels13'], maxDailyOrders: 190, operatingHours: { open: '08:00', close: '21:00' } },
  { id: 'hyper-drogenbos', name: 'Carrefour Drogenbos', type: 'Hypermarket', address: 'Avenue Paul Gilson 455, 1620 Drogenbos', postalCode: '1620', city: 'Drogenbos', lat: 50.7725, lng: 4.3115, businessLines: ['Drive','FastDelivery'], isActive: true, zoneIds: ['z-brussels13'], maxDailyOrders: 210, operatingHours: { open: '08:00', close: '21:00' } },
  { id: 'hyper-kraainem', name: 'Carrefour Kraainem', type: 'Hypermarket', address: 'Avenue de Wezembeeklaan 114, 1950 Kraainem', postalCode: '1950', city: 'Kraainem', lat: 50.8621, lng: 4.4641, businessLines: ['Drive','FastDelivery'], isActive: true, zoneIds: ['z-waterloo'], maxDailyOrders: 200, operatingHours: { open: '08:00', close: '21:00' } },
  { id: 'hyper-strombeek', name: 'Carrefour Strombeek-Bever', type: 'Hypermarket', address: 'Romeinsesteenweg 440, 1853 Strombeek Bever', postalCode: '1853', city: 'Strombeek Bever', lat: 50.9015, lng: 4.3411, businessLines: ['Drive','FastDelivery'], isActive: true, zoneIds: ['z-brussels3'], maxDailyOrders: 170, operatingHours: { open: '08:00', close: '21:00' } },
  { id: 'hyper-zemst', name: 'Carrefour Zemst', type: 'Hypermarket', address: 'Zemstbaan 242, 2800 Zemst', postalCode: '2800', city: 'Zemst', lat: 51.0005, lng: 4.451, businessLines: ['Drive','FastDelivery'], isActive: true, zoneIds: ['z-antwerp2'], maxDailyOrders: 160, operatingHours: { open: '08:00', close: '21:00' } },
  { id: 'hyper-bierges', name: 'Carrefour Bierges', type: 'Hypermarket', address: "Boulevard de l'Europe 3, 1301 Bierges", postalCode: '1301', city: 'Bierges', lat: 50.7215, lng: 4.536, businessLines: ['Drive','FastDelivery'], isActive: true, zoneIds: ['z-waterloo'], maxDailyOrders: 180, operatingHours: { open: '08:00', close: '21:00' } },
  { id: 'hyper-korbeek', name: 'Carrefour Korbeek-Lo', type: 'Hypermarket', address: 'Vlinderlaan 1C, 3360 Korbeek Lo', postalCode: '3360', city: 'Korbeek Lo', lat: 50.855, lng: 4.729, businessLines: ['Drive','FastDelivery'], isActive: true, zoneIds: ['z-hasselt22'], maxDailyOrders: 150, operatingHours: { open: '08:00', close: '21:00' } },
  { id: 'hyper-bruges', name: 'Carrefour Bruges', type: 'Hypermarket', address: 'Maalse Steenweg 310, 8000 Bruges', postalCode: '8000', city: 'Bruges', lat: 51.2094, lng: 3.2247, businessLines: ['Drive','FastDelivery'], isActive: true, zoneIds: ['z-bruges'], maxDailyOrders: 200, operatingHours: { open: '08:00', close: '21:00' } },
  { id: 'hyper-mons', name: 'Carrefour Mons', type: 'Hypermarket', address: 'Boulevard Gendebien 1, 7000 Mons', postalCode: '7000', city: 'Mons', lat: 50.4542, lng: 3.9563, businessLines: ['Drive','FastDelivery'], isActive: true, zoneIds: ['z-mons'], maxDailyOrders: 190, operatingHours: { open: '08:00', close: '21:00' } },
  { id: 'hyper-charleroi', name: 'Carrefour Charleroi', type: 'Hypermarket', address: 'Route de Philippeville 301, 6010 Couillet', postalCode: '6010', city: 'Charleroi', lat: 50.3965, lng: 4.4467, businessLines: ['Drive','FastDelivery'], isActive: true, zoneIds: ['z-charleroi'], maxDailyOrders: 200, operatingHours: { open: '08:00', close: '21:00' } },
  { id: 'hyper-liege', name: 'Carrefour Liege', type: 'Hypermarket', address: 'Rue de la Vecquee 80, 4000 Liege', postalCode: '4000', city: 'Liege', lat: 50.6292, lng: 5.5797, businessLines: ['Drive','FastDelivery'], isActive: true, zoneIds: ['z-liege2'], maxDailyOrders: 210, operatingHours: { open: '08:00', close: '21:00' } },
  { id: 'hyper-namur', name: 'Carrefour Namur', type: 'Hypermarket', address: 'Chaussee de Marche 520, 5100 Jambes', postalCode: '5100', city: 'Namur', lat: 50.4567, lng: 4.8678, businessLines: ['Drive','FastDelivery'], isActive: true, zoneIds: ['z-namur'], maxDailyOrders: 180, operatingHours: { open: '08:00', close: '21:00' } },
  { id: 'hyper-antwerp', name: 'Carrefour Antwerp Linkeroever', type: 'Hypermarket', address: 'Blancefloerlaan 1, 2050 Antwerpen', postalCode: '2050', city: 'Antwerpen', lat: 51.2194, lng: 4.3792, businessLines: ['Drive','FastDelivery'], isActive: true, zoneIds: ['z-antwerp2'], maxDailyOrders: 220, operatingHours: { open: '08:00', close: '21:00' } },
  { id: 'hyper-ghent', name: 'Carrefour Ghent', type: 'Hypermarket', address: 'Sint-Denijslaan 460, 9000 Gent', postalCode: '9000', city: 'Ghent', lat: 51.0543, lng: 3.7174, businessLines: ['Drive','FastDelivery'], isActive: true, zoneIds: ['z-ghent3'], maxDailyOrders: 200, operatingHours: { open: '08:00', close: '21:00' } },
  { id: 'hyper-hasselt', name: 'Carrefour Hasselt', type: 'Hypermarket', address: 'Genkersteenweg 20, 3500 Hasselt', postalCode: '3500', city: 'Hasselt', lat: 50.9307, lng: 5.3378, businessLines: ['Drive','FastDelivery'], isActive: true, zoneIds: ['z-hasselt2'], maxDailyOrders: 170, operatingHours: { open: '08:00', close: '21:00' } },
  { id: 'hyper-turnhout', name: 'Carrefour Turnhout', type: 'Hypermarket', address: 'Parklaan 70, 2300 Turnhout', postalCode: '2300', city: 'Turnhout', lat: 51.3226, lng: 4.9494, businessLines: ['Drive','FastDelivery'], isActive: true, zoneIds: ['z-turnhout'], maxDailyOrders: 140, operatingHours: { open: '08:00', close: '20:00' } },
  { id: 'hyper-kortrijk', name: 'Carrefour Kortrijk', type: 'Hypermarket', address: 'Ring Shopping, 8500 Kortrijk', postalCode: '8500', city: 'Kortrijk', lat: 50.8279, lng: 3.2504, businessLines: ['Drive','FastDelivery'], isActive: true, zoneIds: ['z-kortrijk'], maxDailyOrders: 160, operatingHours: { open: '08:00', close: '20:00' } },
  // ── Markets ───────────────────────────────────────────────
  { id: 'mkt-molenbeek', name: 'Carrefour Market Molenbeek', type: 'Market', address: 'Chaussee de Gand 140, 1080 Molenbeek', postalCode: '1080', city: 'Molenbeek-Saint-Jean', lat: 50.8561, lng: 4.32, businessLines: ['Drive','FastDelivery'], isActive: true, zoneIds: ['z-brussels3'], maxDailyOrders: 80, operatingHours: { open: '08:00', close: '20:00' } },
  { id: 'mkt-laeken', name: 'Carrefour Market Laeken', type: 'Market', address: "Avenue de l'Arbre Ballon 1, 1020 Laken", postalCode: '1020', city: 'Laken', lat: 50.8737, lng: 4.3478, businessLines: ['Drive','FastDelivery'], isActive: true, zoneIds: ['z-brussels3'], maxDailyOrders: 90, operatingHours: { open: '08:00', close: '20:00' } },
  { id: 'mkt-uccle', name: 'Carrefour Market Uccle', type: 'Market', address: 'Chaussee de Waterloo 850, 1180 Uccle', postalCode: '1180', city: 'Uccle', lat: 50.801, lng: 4.3526, businessLines: ['Drive','FastDelivery'], isActive: true, zoneIds: ['z-brussels13'], maxDailyOrders: 85, operatingHours: { open: '08:00', close: '20:00' } },
  { id: 'mkt-woluwe', name: 'Carrefour Market Woluwe', type: 'Market', address: 'Tomberg Street 96, 1200 Woluwe-St-Lambert', postalCode: '1200', city: 'Woluwe-St-Lambert', lat: 50.8505, lng: 4.421, businessLines: ['Drive','FastDelivery'], isActive: true, zoneIds: ['z-brussels13'], maxDailyOrders: 95, operatingHours: { open: '08:00', close: '20:00' } },
  { id: 'mkt-schaerbeek', name: 'Carrefour Market Schaerbeek', type: 'Market', address: 'Rue Vandevelde 17, 1030 Schaerbeek', postalCode: '1030', city: 'Schaerbeek', lat: 50.8598, lng: 4.378, businessLines: ['Drive','FastDelivery'], isActive: true, zoneIds: ['z-brussels3'], maxDailyOrders: 75, operatingHours: { open: '08:00', close: '20:00' } },
  { id: 'mkt-etterbeek', name: 'Carrefour Market Etterbeek', type: 'Market', address: 'Avenue de Tervueren 84, 1040 Etterbeek', postalCode: '1040', city: 'Etterbeek', lat: 50.837, lng: 4.39, businessLines: ['Drive','FastDelivery'], isActive: true, zoneIds: ['z-brussels13'], maxDailyOrders: 80, operatingHours: { open: '08:00', close: '20:00' } },
  { id: 'mkt-ixelles', name: 'Carrefour Market Ixelles', type: 'Market', address: 'Chaussee de Boondael 452, 1050 Ixelles', postalCode: '1050', city: 'Ixelles', lat: 50.818, lng: 4.383, businessLines: ['Drive','FastDelivery'], isActive: true, zoneIds: ['z-brussels13'], maxDailyOrders: 85, operatingHours: { open: '08:00', close: '20:00' } },
  { id: 'mkt-waterloo', name: 'Carrefour Market Waterloo', type: 'Market', address: 'Richelle Drive 10, 1410 Waterloo', postalCode: '1410', city: 'Waterloo', lat: 50.715, lng: 4.3875, businessLines: ['Drive'], isActive: true, zoneIds: ['z-waterloo'], maxDailyOrders: 70, operatingHours: { open: '08:00', close: '20:00' } },
  { id: 'mkt-wemmel', name: 'Carrefour Market Wemmel', type: 'Market', address: 'Vijverslaan 34, 1780 Wemmel', postalCode: '1780', city: 'Wemmel', lat: 50.9115, lng: 4.3015, businessLines: ['Drive','FastDelivery'], isActive: true, zoneIds: ['z-brussels3'], maxDailyOrders: 65, operatingHours: { open: '08:00', close: '20:00' } },
  { id: 'mkt-tervuren', name: 'Carrefour Market Tervuren', type: 'Market', address: 'Hoornzeelstraat 12, 3080 Tervuren', postalCode: '3080', city: 'Tervuren', lat: 50.8225, lng: 4.518, businessLines: ['Drive'], isActive: true, zoneIds: ['z-waterloo'], maxDailyOrders: 60, operatingHours: { open: '08:00', close: '20:00' } },
  { id: 'mkt-grimbergen', name: 'Carrefour Market Grimbergen', type: 'Market', address: 'Wolvertemsesteenweg 244, 1850 Grimbergen', postalCode: '1850', city: 'Grimbergen', lat: 50.9345, lng: 4.369, businessLines: ['Drive'], isActive: true, zoneIds: ['z-brussels2'], maxDailyOrders: 65, operatingHours: { open: '08:00', close: '20:00' } },
  { id: 'mkt-herent', name: 'Carrefour Market Herent', type: 'Market', address: 'Broekveldstraat 34, 3020 Herent', postalCode: '3020', city: 'Herent', lat: 50.8932, lng: 4.675, businessLines: ['Drive'], isActive: true, zoneIds: ['z-leuven'], maxDailyOrders: 55, operatingHours: { open: '08:00', close: '20:00' } },
  { id: 'mkt-kortenberg', name: 'Carrefour Market Kortenberg', type: 'Market', address: 'Maria Christinastraat 19, 3070 Kortenberg', postalCode: '3070', city: 'Kortenberg', lat: 50.8887, lng: 4.5312, businessLines: ['Drive','FastDelivery'], isActive: true, zoneIds: ['z-leuven'], maxDailyOrders: 70, operatingHours: { open: '08:00', close: '20:00' } },
  { id: 'mkt-stniklaas', name: 'Carrefour Market Sint-Niklaas', type: 'Market', address: 'Kapelstraat 100, 9100 Sint-Niklaas', postalCode: '9100', city: 'Sint-Niklaas', lat: 51.1636, lng: 4.1442, businessLines: ['Drive','FastDelivery'], isActive: true, zoneIds: ['z-stniklaas'], maxDailyOrders: 80, operatingHours: { open: '08:00', close: '20:00' } },
  { id: 'mkt-leuven', name: 'Carrefour Market Leuven', type: 'Market', address: 'Diestsestraat 150, 3000 Leuven', postalCode: '3000', city: 'Leuven', lat: 50.8798, lng: 4.7005, businessLines: ['Drive','FastDelivery'], isActive: true, zoneIds: ['z-leuven'], maxDailyOrders: 90, operatingHours: { open: '08:00', close: '20:00' } },
  { id: 'mkt-tournai', name: 'Carrefour Market Tournai', type: 'Market', address: 'Boulevard des Nerviens 30, 7500 Tournai', postalCode: '7500', city: 'Tournai', lat: 50.6073, lng: 3.3881, businessLines: ['Drive'], isActive: true, zoneIds: ['z-tournai'], maxDailyOrders: 55, operatingHours: { open: '08:00', close: '20:00' } },
  { id: 'mkt-mouscron', name: 'Carrefour Market Mouscron', type: 'Market', address: 'Rue du Calvaire 12, 7700 Mouscron', postalCode: '7700', city: 'Mouscron', lat: 50.7433, lng: 3.2139, businessLines: ['Drive'], isActive: true, zoneIds: ['z-mouscron'], maxDailyOrders: 50, operatingHours: { open: '08:00', close: '20:00' } },
  { id: 'mkt-nivelles', name: 'Carrefour Market Nivelles', type: 'Market', address: 'Avenue de Burlet 2, 1400 Nivelles', postalCode: '1400', city: 'Nivelles', lat: 50.5984, lng: 4.3294, businessLines: ['Drive'], isActive: true, zoneIds: ['z-nivellestubize'], maxDailyOrders: 60, operatingHours: { open: '08:00', close: '20:00' } },
  // ── Express ───────────────────────────────────────────────
  { id: 'exp-centre', name: 'Carrefour Express Centre', type: 'Express', address: 'Rue Neuve 123, 1000 Brussels', postalCode: '1000', city: 'Brussels', lat: 50.852, lng: 4.355, businessLines: ['FastDelivery'], isActive: true, zoneIds: ['z-brussels13'], maxDailyOrders: 40, operatingHours: { open: '07:00', close: '22:00' } },
  { id: 'exp-louise', name: 'Carrefour Express Louise', type: 'Express', address: 'Avenue Louise 331, 1050 Brussels', postalCode: '1050', city: 'Brussels', lat: 50.827, lng: 4.36, businessLines: ['FastDelivery'], isActive: true, zoneIds: ['z-brussels13'], maxDailyOrders: 35, operatingHours: { open: '07:00', close: '22:00' } },
  { id: 'exp-stgilles', name: 'Carrefour Express St-Gilles', type: 'Express', address: 'Chaussee de Charleroi 70, 1060 Saint-Gilles', postalCode: '1060', city: 'Saint-Gilles', lat: 50.833, lng: 4.343, businessLines: ['FastDelivery'], isActive: true, zoneIds: ['z-brussels13'], maxDailyOrders: 35, operatingHours: { open: '07:00', close: '22:00' } },
  { id: 'exp-flagey', name: 'Carrefour Express Flagey', type: 'Express', address: 'Place Flagey 18, 1050 Ixelles', postalCode: '1050', city: 'Ixelles', lat: 50.8275, lng: 4.373, businessLines: ['FastDelivery'], isActive: true, zoneIds: ['z-brussels13'], maxDailyOrders: 30, operatingHours: { open: '07:00', close: '22:00' } },
  { id: 'exp-montgomery', name: 'Carrefour Express Montgomery', type: 'Express', address: 'Avenue de Tervueren 2, 1040 Etterbeek', postalCode: '1040', city: 'Etterbeek', lat: 50.8405, lng: 4.404, businessLines: ['FastDelivery'], isActive: true, zoneIds: ['z-brussels13'], maxDailyOrders: 30, operatingHours: { open: '07:00', close: '22:00' } },
  { id: 'exp-stockel', name: 'Carrefour Express Stockel', type: 'Express', address: 'Avenue de Stockel 15, 1150 Woluwe-St-Pierre', postalCode: '1150', city: 'Woluwe-St-Pierre', lat: 50.834, lng: 4.445, businessLines: ['FastDelivery'], isActive: true, zoneIds: ['z-brussels13'], maxDailyOrders: 25, operatingHours: { open: '07:00', close: '22:00' } },
  { id: 'exp-jette', name: 'Carrefour Express Jette', type: 'Express', address: 'Boulevard de Smet de Naeyer 120, 1090 Jette', postalCode: '1090', city: 'Jette', lat: 50.875, lng: 4.325, businessLines: ['FastDelivery'], isActive: true, zoneIds: ['z-brussels3'], maxDailyOrders: 30, operatingHours: { open: '07:00', close: '22:00' } },
  { id: 'exp-forest', name: 'Carrefour Express Forest', type: 'Express', address: 'Avenue Van Volxem 240, 1190 Forest', postalCode: '1190', city: 'Forest', lat: 50.81, lng: 4.325, businessLines: ['FastDelivery'], isActive: true, zoneIds: ['z-brussels13'], maxDailyOrders: 30, operatingHours: { open: '07:00', close: '22:00' } },
  { id: 'exp-antwerp', name: 'Carrefour Express Antwerp Centraal', type: 'Express', address: 'Keyserlei 50, 2018 Antwerpen', postalCode: '2018', city: 'Antwerpen', lat: 51.2171, lng: 4.4203, businessLines: ['FastDelivery'], isActive: true, zoneIds: ['z-antwerp-1'], maxDailyOrders: 40, operatingHours: { open: '07:00', close: '22:00' } },
  { id: 'exp-ghent', name: 'Carrefour Express Ghent Sint-Pieters', type: 'Express', address: 'Koning Albertlaan 2, 9000 Gent', postalCode: '9000', city: 'Ghent', lat: 51.0363, lng: 3.7109, businessLines: ['FastDelivery'], isActive: true, zoneIds: ['z-ghent3'], maxDailyOrders: 35, operatingHours: { open: '07:00', close: '22:00' } },
  { id: 'exp-liege', name: 'Carrefour Express Liege Guillemins', type: 'Express', address: 'Rue des Guillemins 100, 4000 Liege', postalCode: '4000', city: 'Liege', lat: 50.6244, lng: 5.5667, businessLines: ['FastDelivery'], isActive: true, zoneIds: ['z-liege2'], maxDailyOrders: 30, operatingHours: { open: '07:00', close: '22:00' } },
  { id: 'exp-namur', name: 'Carrefour Express Namur Gare', type: 'Express', address: 'Place de la Station 1, 5000 Namur', postalCode: '5000', city: 'Namur', lat: 50.469, lng: 4.862, businessLines: ['FastDelivery'], isActive: true, zoneIds: ['z-namur'], maxDailyOrders: 25, operatingHours: { open: '07:00', close: '22:00' } },
];

// ── Slot Config ─────────────────────────────────────────────

// Generate day-wise slot templates for the default config
const _baseSlots = [
  { startTime: '08:00', endTime: '09:00', timeOfDay: 'morning' as const, label: 'Express', businessLines: ['LAD','FastDelivery'] as BusinessLine[] },
  { startTime: '08:00', endTime: '10:00', timeOfDay: 'morning' as const, label: 'Standard', businessLines: ['LAD','Drive'] as BusinessLine[] },
  { startTime: '08:00', endTime: '12:00', timeOfDay: 'morning' as const, label: 'Flex', businessLines: ['LAD'] as BusinessLine[] },
  { startTime: '10:00', endTime: '12:00', timeOfDay: 'morning' as const, label: 'Standard', businessLines: ['LAD','Drive'] as BusinessLine[] },
  { startTime: '12:00', endTime: '14:00', timeOfDay: 'afternoon' as const, label: 'Standard', businessLines: ['LAD','Drive','FastDelivery'] as BusinessLine[] },
  { startTime: '14:00', endTime: '16:00', timeOfDay: 'afternoon' as const, label: 'Standard', businessLines: ['LAD','Drive','FastDelivery'] as BusinessLine[] },
  { startTime: '16:00', endTime: '18:00', timeOfDay: 'afternoon' as const, label: 'Standard', businessLines: ['LAD','Drive'] as BusinessLine[] },
  { startTime: '17:00', endTime: '19:00', timeOfDay: 'evening' as const, label: 'Standard', businessLines: ['LAD'] as BusinessLine[] },
  { startTime: '18:00', endTime: '20:00', timeOfDay: 'evening' as const, label: 'Standard', businessLines: ['LAD'] as BusinessLine[] },
  { startTime: '19:00', endTime: '21:00', timeOfDay: 'evening' as const, label: 'Standard', businessLines: ['LAD'] as BusinessLine[] },
];
const _days: DayOfWeek[] = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const _defaultTemplates: SlotTemplate[] = _days.flatMap((day, di) =>
  _baseSlots.map((s, si) => ({
    id: `st-${di}-${si}`,
    day,
    startTime: s.startTime,
    endTime: s.endTime,
    timeOfDay: s.timeOfDay,
    label: s.label,
    businessLines: [...s.businessLines],
    isActive: day !== 'Friday', // Friday slots inactive by default (client data)
  }))
);

export const defaultSlotConfig: SlotConfiguration = {
  templates: _defaultTemplates,
  capacityRules: [
    { dimension: 'orders', limit: 40, isActive: true },
    { dimension: 'items', limit: 320, isActive: true },
    { dimension: 'weight_kg', limit: 1200, isActive: false },
    { dimension: 'volume_m3', limit: 8, isActive: false },
  ],
  cutOffRules: [
    { id: 'co1', scope: 'slot_label', scopeValue: 'Express', cutOffHours: 2, cutOffMinutes: 0, businessLine: 'all' },
    { id: 'co2', scope: 'slot_label', scopeValue: 'Standard', cutOffHours: 4, cutOffMinutes: 0, businessLine: 'LAD' },
    { id: 'co3', scope: 'slot_label', scopeValue: 'Standard', cutOffHours: 3, cutOffMinutes: 0, businessLine: 'Drive' },
    { id: 'co4', scope: 'slot_label', scopeValue: 'Flex', cutOffHours: 6, cutOffMinutes: 0, businessLine: 'LAD' },
    { id: 'co5', scope: 'carrier', scopeValue: 'bpost', cutOffHours: 5, cutOffMinutes: 0, businessLine: 'LAD' },
    { id: 'co6', scope: 'business_line', scopeValue: 'FastDelivery', cutOffHours: 0, cutOffMinutes: 45, businessLine: 'FastDelivery' },
  ],
  reservationPct: 20,
  reservationStrategy: 'BALANCED',
  reservationDurationSec: 600,
  segmentReservations: { standard: 0, plus: 5, premium: 10, vip: 15 },
  waveCapacity: { ordersPerWave: 25, itemsPerWave: 200, waveDurationMin: 90 },
};

// ── Yield Config ────────────────────────────────────────────

export const defaultYieldConfig: YieldConfiguration = {
  rateCards: [
    { businessLine: 'LAD', baseFee: 5.99, floorPrice: 1.99, isActive: true },
    { businessLine: 'Drive', baseFee: 0, floorPrice: 0, isActive: true },
    { businessLine: 'FastDelivery', baseFee: 8.99, floorPrice: 4.99, isActive: true },
  ],
  segmentPricing: [
    { segment: 'standard', discountPct: 0, freeDeliveryThreshold: 200, maxDeliveryFee: 12.99 },
    { segment: 'plus', discountPct: 15, freeDeliveryThreshold: 150, maxDeliveryFee: 9.99 },
    { segment: 'premium', discountPct: 30, freeDeliveryThreshold: 100, maxDeliveryFee: 7.99 },
    { segment: 'vip', discountPct: 100, freeDeliveryThreshold: 0, maxDeliveryFee: 0 },
  ],
  timeOfDayWeights: { morning: 0.85, afternoon: 1.0, evening: 1.4 },
  dayOfWeekWeights: { Monday: 0.9, Tuesday: 0.85, Wednesday: 0.9, Thursday: 1.0, Friday: 1.15, Saturday: 1.3, Sunday: 0.7 },
  surgeTiers: [
    { thresholdPct: 75, surchargeAmount: 1.0 },
    { thresholdPct: 85, surchargeAmount: 2.0 },
    { thresholdPct: 95, surchargeAmount: 4.0 },
  ],
  greenDiscountPct: 25,
  greenCriteria: ['Vehicle already in neighborhood', 'Off-peak window', 'Electric vehicle route', 'Consolidation opportunity'],
  psychologicalRounding: true,
  roundingRule: '.99',
  priceLockDurationMin: 15,
  maxDemandFactor: 0.6,
  rules: [
    { id: 'r1', name: 'Customer-specific rate card', priority: 1, type: 'exclusive', condition: 'Customer has assigned rate card', adjustment: 'Use customer rate card', isActive: true },
    { id: 'r2', name: 'Segment pricing', priority: 2, type: 'exclusive', condition: 'Customer belongs to segment', adjustment: 'Apply segment discount', isActive: true },
    { id: 'r3', name: 'Promo code discount', priority: 3, type: 'cumulative', condition: 'Valid promo code applied', adjustment: 'Apply promo discount (stacks)', isActive: true },
    { id: 'r4', name: 'Green slot incentive', priority: 4, type: 'cumulative', condition: 'Slot is marked green', adjustment: 'Apply green discount %', isActive: true },
    { id: 'r5', name: 'Surge surcharge', priority: 5, type: 'cumulative', condition: 'Capacity exceeds threshold', adjustment: 'Add surge amount', isActive: true },
    { id: 'r6', name: 'Floor price enforcement', priority: 99, type: 'exclusive', condition: 'Calculated fee < floor', adjustment: 'Set to floor price', isActive: true },
  ],
  manualOverrides: [
    { id: 'mo1', date: '2026-05-16', slotLabel: 'Evening', timeOfDay: 'evening', price: 3.99, reason: 'Marketing campaign — evening push', expiresAt: '2026-05-17', createdBy: 'admin@carrefour.be' },
  ],
};

// ── Carriers (Q&A #50: 5 carriers, 65/35 split) ────────────

export const carriers: Carrier[] = [
  { id: 'c-own', name: 'Carrefour Fleet', type: 'own_fleet', status: 'active', businessLines: ['LAD'], zoneIds: ['z1','z2','z3','z4','z5','z6','z7','z8','z9','z10'], costPerDelivery: 4.20, slaHours: 24, maxDailyCapacity: 280, apiEndpoint: 'internal', apiStatus: 'connected', isDedicated: true, vehicleTypes: ['Van','Refrigerated Van','Electric Van'] },
  { id: 'c-bpost', name: 'bpost', type: '3pl', status: 'active', businessLines: ['LAD'], zoneIds: ['z1','z2','z3','z9','z11','z12','z16'], costPerDelivery: 5.80, slaHours: 24, maxDailyCapacity: 150, apiEndpoint: 'https://api.bpost.be/v2/delivery', apiStatus: 'connected', isDedicated: true, vehicleTypes: ['Van'] },
  { id: 'c-dhl', name: 'DHL Express', type: '3pl', status: 'active', businessLines: ['LAD'], zoneIds: ['z3','z4','z7','z10','z11','z15','z18'], costPerDelivery: 6.40, slaHours: 24, maxDailyCapacity: 120, apiEndpoint: 'https://api.dhl.com/logistics/v1', apiStatus: 'connected', isDedicated: true, vehicleTypes: ['Van','Sprinter'] },
  { id: 'c-mondial', name: 'Mondial Relay', type: '3pl', status: 'active', businessLines: ['LAD'], zoneIds: ['z5','z9','z13','z14'], costPerDelivery: 5.20, slaHours: 48, maxDailyCapacity: 80, apiEndpoint: 'https://api.mondialrelay.com/v1', apiStatus: 'connected', isDedicated: true, vehicleTypes: ['Van'] },
  { id: 'c-gls', name: 'GLS Belgium', type: '3pl', status: 'active', businessLines: ['LAD'], zoneIds: ['z8','z12','z16'], costPerDelivery: 5.50, slaHours: 24, maxDailyCapacity: 90, apiEndpoint: 'https://api.gls-group.eu/v1', apiStatus: 'connected', isDedicated: true, vehicleTypes: ['Van'] },
  { id: 'c-gorillas', name: 'Gorillas', type: '3pl', status: 'active', businessLines: ['FastDelivery'], zoneIds: ['z1','z3','z6'], costPerDelivery: 7.50, slaHours: 1, maxDailyCapacity: 200, apiEndpoint: 'https://api.gorillas.io/v1', apiStatus: 'connected', isDedicated: false, vehicleTypes: ['E-Cargo Bike'] },
  { id: 'c-deliveroo', name: 'Deliveroo', type: '3pl', status: 'active', businessLines: ['FastDelivery'], zoneIds: ['z1','z2','z4','z17','z18'], costPerDelivery: 8.20, slaHours: 1, maxDailyCapacity: 300, apiEndpoint: 'https://api.deliveroo.com/v2', apiStatus: 'connected', isDedicated: false, vehicleTypes: ['Bicycle','Scooter'] },
];

// ── Allocation Rules ────────────────────────────────────────

export const allocationRules: AllocationRule[] = [
  { id: 'ar1', businessLine: 'LAD', priority: 1, carrierId: 'c-own', zoneCoverage: ['z1','z2','z3','z4','z5','z6','z7','z8','z9','z10'], maxPct: 65, isActive: true },
  { id: 'ar2', businessLine: 'LAD', priority: 2, carrierId: 'c-bpost', zoneCoverage: ['z1','z2','z3','z9','z11','z12','z16'], maxPct: 15, isActive: true },
  { id: 'ar3', businessLine: 'LAD', priority: 3, carrierId: 'c-dhl', zoneCoverage: ['z3','z4','z7','z10','z11','z15','z18'], maxPct: 10, isActive: true },
  { id: 'ar4', businessLine: 'LAD', priority: 4, carrierId: 'c-mondial', zoneCoverage: ['z5','z9','z13','z14'], maxPct: 5, isActive: true },
  { id: 'ar5', businessLine: 'LAD', priority: 5, carrierId: 'c-gls', zoneCoverage: ['z8','z12','z16'], maxPct: 5, isActive: true },
  { id: 'ar6', businessLine: 'FastDelivery', priority: 1, carrierId: 'c-gorillas', zoneCoverage: ['z1','z3','z6'], maxPct: 60, isActive: true },
  { id: 'ar7', businessLine: 'FastDelivery', priority: 2, carrierId: 'c-deliveroo', zoneCoverage: ['z1','z2','z4','z17','z18'], maxPct: 40, isActive: true },
];

// ── Customer Segments ───────────────────────────────────────

export const segments: SegmentDefinition[] = [
  { id: 'standard', name: 'Standard', description: 'Default customer tier', color: '#6B7280', capacityReservePct: 0, cutOffExtensionMin: 0, pricingDiscountPct: 0, freeDeliveryThreshold: 200, priorityLevel: 1, isActive: true },
  { id: 'plus', name: 'Carrefour Plus', description: 'Loyalty program members', color: '#1659CB', capacityReservePct: 5, cutOffExtensionMin: 30, pricingDiscountPct: 15, freeDeliveryThreshold: 150, priorityLevel: 2, isActive: true },
  { id: 'premium', name: 'Premium', description: 'High-value repeat customers', color: '#7C3AED', capacityReservePct: 10, cutOffExtensionMin: 60, pricingDiscountPct: 30, freeDeliveryThreshold: 100, priorityLevel: 3, isActive: true },
  { id: 'vip', name: 'VIP', description: 'Corporate & enterprise accounts', color: '#B45309', capacityReservePct: 15, cutOffExtensionMin: 120, pricingDiscountPct: 100, freeDeliveryThreshold: 0, priorityLevel: 4, isActive: true },
];

// ── Holidays (Belgian bank holidays 2026) ───────────────────

export const holidays: Holiday[] = [
  { id: 'h1', name: 'New Year', date: '2026-01-01', isNational: true, affectedStoreIds: 'all', action: 'close_all_slots' },
  { id: 'h2', name: 'Easter Monday', date: '2026-04-06', isNational: true, affectedStoreIds: 'all', action: 'close_all_slots' },
  { id: 'h3', name: 'Labour Day', date: '2026-05-01', isNational: true, affectedStoreIds: 'all', action: 'close_all_slots' },
  { id: 'h4', name: 'Ascension Day', date: '2026-05-14', isNational: true, affectedStoreIds: 'all', action: 'reduce_capacity', capacityPct: 50 },
  { id: 'h5', name: 'Whit Monday', date: '2026-05-25', isNational: true, affectedStoreIds: 'all', action: 'close_all_slots' },
  { id: 'h6', name: 'Belgian National Day', date: '2026-07-21', isNational: true, affectedStoreIds: 'all', action: 'close_all_slots' },
  { id: 'h7', name: 'Assumption of Mary', date: '2026-08-15', isNational: true, affectedStoreIds: 'all', action: 'close_all_slots' },
  { id: 'h8', name: 'All Saints Day', date: '2026-11-01', isNational: true, affectedStoreIds: 'all', action: 'close_all_slots' },
  { id: 'h9', name: 'Armistice Day', date: '2026-11-11', isNational: true, affectedStoreIds: 'all', action: 'reduce_capacity', capacityPct: 50 },
  { id: 'h10', name: 'Christmas Day', date: '2026-12-25', isNational: true, affectedStoreIds: 'all', action: 'close_all_slots' },
  { id: 'h11', name: 'Christmas Eve (early close)', date: '2026-12-24', isNational: false, affectedStoreIds: 'all', action: 'custom_hours', customHours: { open: '08:00', close: '14:00' } },
  { id: 'h12', name: 'Brussels Iris Festival', date: '2026-05-08', isNational: false, affectedStoreIds: ['hub-north','s2'], action: 'reduce_capacity', capacityPct: 70 },
];

// ── Slot Templates ──────────────────────────────────────────

export const slotTemplates: SlotTemplateConfig[] = [
  {
    id: 'tpl-lad-weekday', name: 'LAD Weekday Standard', frequency: 'weekly', businessLine: 'LAD', storeIds: ['4459','4660','4661'], holidayBehavior: 'skip', isActive: true, activeSince: '2026-01-15',
    slots: [
      { id: 'ts1', day: 'Monday', startTime: '08:00', endTime: '10:00', timeOfDay: 'morning', label: 'Standard', businessLines: ['LAD'], isActive: true },
      { id: 'ts2', day: 'Monday', startTime: '10:00', endTime: '12:00', timeOfDay: 'morning', label: 'Standard', businessLines: ['LAD'], isActive: true },
      { id: 'ts3', day: 'Monday', startTime: '12:00', endTime: '14:00', timeOfDay: 'afternoon', label: 'Standard', businessLines: ['LAD'], isActive: true },
      { id: 'ts4', day: 'Monday', startTime: '14:00', endTime: '16:00', timeOfDay: 'afternoon', label: 'Standard', businessLines: ['LAD'], isActive: true },
      { id: 'ts5', day: 'Monday', startTime: '16:00', endTime: '18:00', timeOfDay: 'afternoon', label: 'Standard', businessLines: ['LAD'], isActive: true },
      { id: 'ts6', day: 'Monday', startTime: '18:00', endTime: '20:00', timeOfDay: 'evening', label: 'Standard', businessLines: ['LAD'], isActive: true },
    ],
  },
  {
    id: 'tpl-lad-saturday', name: 'LAD Saturday', frequency: 'weekly', businessLine: 'LAD', storeIds: ['4459','4660','4661'], holidayBehavior: 'skip', isActive: true, activeSince: '2026-01-15',
    slots: [
      { id: 'ts7', day: 'Saturday', startTime: '09:00', endTime: '12:00', timeOfDay: 'morning', label: 'Flex', businessLines: ['LAD'], isActive: true },
      { id: 'ts8', day: 'Saturday', startTime: '12:00', endTime: '15:00', timeOfDay: 'afternoon', label: 'Standard', businessLines: ['LAD'], isActive: true },
      { id: 'ts9', day: 'Saturday', startTime: '15:00', endTime: '18:00', timeOfDay: 'afternoon', label: 'Standard', businessLines: ['LAD'], isActive: true },
    ],
  },
  {
    id: 'tpl-drive-all', name: 'Drive Standard (All Stores)', frequency: 'daily', businessLine: 'Drive', storeIds: 'all', holidayBehavior: 'skip', isActive: true, activeSince: '2026-02-01',
    slots: [
      { id: 'ts10', day: 'Monday', startTime: '10:00', endTime: '12:00', timeOfDay: 'morning', label: 'Standard', businessLines: ['Drive'], isActive: true },
      { id: 'ts11', day: 'Monday', startTime: '14:00', endTime: '16:00', timeOfDay: 'afternoon', label: 'Standard', businessLines: ['Drive'], isActive: true },
      { id: 'ts12', day: 'Monday', startTime: '16:00', endTime: '18:00', timeOfDay: 'afternoon', label: 'Standard', businessLines: ['Drive'], isActive: true },
    ],
  },
  {
    id: 'tpl-fast-express', name: 'Fast Delivery Express', frequency: 'daily', businessLine: 'FastDelivery', storeIds: 'all', holidayBehavior: 'reduce_50', isActive: true, activeSince: '2026-03-01',
    slots: [
      { id: 'ts13', day: 'Monday', startTime: '10:00', endTime: '11:00', timeOfDay: 'morning', label: 'Express', businessLines: ['FastDelivery'], isActive: true },
      { id: 'ts14', day: 'Monday', startTime: '12:00', endTime: '13:00', timeOfDay: 'afternoon', label: 'Express', businessLines: ['FastDelivery'], isActive: true },
      { id: 'ts15', day: 'Monday', startTime: '17:00', endTime: '18:00', timeOfDay: 'evening', label: 'Express', businessLines: ['FastDelivery'], isActive: true },
    ],
  },
];

// ── Emergency Overrides ─────────────────────────────────────

export const emergencyOverrides: EmergencyOverride[] = [
  { id: 'eo1', type: 'reduce_capacity', scope: 'store', scopeValue: 'hub-north', reason: 'Vehicle maintenance — 3 vans out of service', createdBy: 'ops@carrefour.be', createdAt: '2026-05-13T08:30:00Z', expiresAt: '2026-05-14T18:00:00Z', isActive: true, params: { capacityPct: 70 } },
  { id: 'eo2', type: 'close_slot', scope: 'zone', scopeValue: 'z9', reason: 'Road closure — Waterloo marathon', createdBy: 'dispatch@carrefour.be', createdAt: '2026-05-12T16:00:00Z', expiresAt: '2026-05-13T20:00:00Z', isActive: false, params: { affectedSlots: 'evening' } },
];

// ── A/B Testing ─────────────────────────────────────────────

export const experiments: ABExperiment[] = [
  { id: 'exp1', name: 'Evening Surge Pricing Impact', description: 'Test whether higher surge pricing shifts demand to afternoon slots', status: 'running', variantA: { name: 'Control', config: 'Surge +EUR2.00 at 85%' }, variantB: { name: 'High Surge', config: 'Surge +EUR3.50 at 80%' }, trafficSplitPct: 50, metric: 'Evening slot fill rate', startDate: '2026-05-01', endDate: '2026-05-31', resultSummary: { variantAValue: 91.2, variantBValue: 78.4, winner: 'inconclusive' } },
  { id: 'exp2', name: 'Green Slot Discount Level', description: 'Test 15% vs 30% eco discount on Flex slot adoption', status: 'completed', variantA: { name: '15% Discount', config: 'greenDiscountPct: 15' }, variantB: { name: '30% Discount', config: 'greenDiscountPct: 30' }, trafficSplitPct: 50, metric: 'Green slot conversion rate', startDate: '2026-04-01', endDate: '2026-04-30', resultSummary: { variantAValue: 12.8, variantBValue: 24.3, winner: 'B' } },
  { id: 'exp3', name: 'Free Delivery Threshold', description: 'Test lowering free delivery threshold from EUR150 to EUR100 for Plus members', status: 'draft', variantA: { name: 'Current (EUR150)', config: 'freeDeliveryThreshold: 150' }, variantB: { name: 'Lower (EUR100)', config: 'freeDeliveryThreshold: 100' }, trafficSplitPct: 30, metric: 'Average basket value', startDate: '2026-06-01', endDate: '2026-06-30' },
];

// ── System Config ───────────────────────────────────────────

export const defaultSystemConfig: SystemConfig = {
  fallbackMode: 'static_slots',
  fallbackMessage: 'Delivery slots are temporarily unavailable. Please try again in a few minutes.',
  healthCheckIntervalSec: 30,
  maxOverbookingPct: 5,
  concurrencyLockTimeoutSec: 10,
  waitlistEnabled: true,
  waitlistMaxSize: 50,
  raceConditionStrategy: 'optimistic_lock',
  priceLockEnabled: true,
  priceLockDurationMin: 15,
};

// ── Audit Log ───────────────────────────────────────────────

export const auditLog: AuditEntry[] = [
  { id: 'a1', timestamp: '2026-05-13T09:15:00Z', user: 'admin@carrefour.be', section: 'Yield Management', action: 'update', target: 'Surge threshold', before: '80%', after: '85%' },
  { id: 'a2', timestamp: '2026-05-13T08:30:00Z', user: 'ops@carrefour.be', section: 'Emergency Overrides', action: 'emergency', target: 'Hub North capacity', before: '100%', after: '70% (vehicle maintenance)' },
  { id: 'a3', timestamp: '2026-05-12T16:45:00Z', user: 'admin@carrefour.be', section: 'Slot Management', action: 'update', target: 'Evening slot capacity', before: '40 orders', after: '50 orders' },
  { id: 'a4', timestamp: '2026-05-12T16:00:00Z', user: 'dispatch@carrefour.be', section: 'Emergency Overrides', action: 'emergency', target: 'Zone z9 evening slots', before: 'Open', after: 'Closed (Waterloo marathon)' },
  { id: 'a5', timestamp: '2026-05-12T14:20:00Z', user: 'admin@carrefour.be', section: 'Yield Management', action: 'create', target: 'Manual override — evening push', before: '—', after: 'EUR3.99 on 2026-05-16' },
  { id: 'a6', timestamp: '2026-05-12T11:00:00Z', user: 'admin@carrefour.be', section: 'Carrier Management', action: 'update', target: 'GLS Belgium daily capacity', before: '80', after: '90' },
  { id: 'a7', timestamp: '2026-05-11T09:30:00Z', user: 'admin@carrefour.be', section: 'Holiday Calendar', action: 'create', target: 'Brussels Iris Festival', before: '—', after: 'Capacity 70% on 2026-05-08' },
  { id: 'a8', timestamp: '2026-05-10T17:00:00Z', user: 'ops@carrefour.be', section: 'Zone Management', action: 'update', target: 'Zone z11 postal codes', before: '3000,3001', after: '3000,3001,3010,3020' },
  { id: 'a9', timestamp: '2026-05-10T15:15:00Z', user: 'admin@carrefour.be', section: 'A/B Testing', action: 'create', target: 'Experiment: Evening Surge Pricing', before: '—', after: 'Running (50/50 split)' },
  { id: 'a10', timestamp: '2026-05-09T10:00:00Z', user: 'admin@carrefour.be', section: 'Customer Segments', action: 'update', target: 'Premium free delivery threshold', before: 'EUR120', after: 'EUR100' },
];
