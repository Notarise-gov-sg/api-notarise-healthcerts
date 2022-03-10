# Recommended Coding Set

## Type of Test ([Loinc](http://loinc.org))

> **FHIR Mapping**: Observation.code.coding[0].{ system, code, display }

<table>
<thead>
  <tr>
    <th>Type</th>
    <th>Code</th>
    <th>Display</th>
    <th>EU DCC</th>
    <th>GPay COVID Card</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td rowspan="2">"PCR"</td>
    <td>94531-1</td>
    <td>SARS-CoV-2 (COVID-19) RNA panel - Respiratory specimen by NAA with probe detection</td>
    <td>✅</td>
    <td>✅</td>
  </tr>
  <tr>
    <td>94309-2</td>
    <td>SARS-CoV-2 (COVID-19) RNA [Presence] in Specimen by NAA with probe detection</td>
    <td>✅</td>
    <td>✅</td>
  </tr>
  <tr>
    <td>"ART"</td>
    <td>97097-0</td>
    <td>SARS-CoV-2 (COVID-19) Ag [Presence] in Upper respiratory specimen by Rapid immunoassay</td>
    <td>✅</td>
    <td>✅</td>
  </tr>
  <tr>
    <td>"SER"</td>
    <td>94661-6</td>
    <td>SARS-CoV-2 (COVID-19) Ab [Interpretation] in Serum or Plasma</td>
    <td>❌</td>
    <td>✅</td>
  </tr>
  <tr>
    <td>"LAMP"</td>
    <td>96986-5</td>
    <td>SARS-CoV-2 (COVID-19) N gene [Presence] in Nose by NAA with non-probe detection</td>
    <td>❌</td>
    <td>✅</td>
  </tr>
</tbody>
</table>

\***IMPORTANT**: Using codes outside of this table may not result in the generation of EU DCC QRs or GPay COVID Cards

Example:

```json
{
  "system": "http://loinc.org",
  "code": "94531-1",
  "display": "SARS-CoV-2 (COVID-19) RNA panel - Respiratory specimen by NAA with probe detection"
}
```

## Test Result ([Snomed](http://snomed.info/sct))

> **FHIR Mapping**: Observation.valueCodeableConcept.coding[0].{ system, code, display }

| Code      | Display  |
| --------- | -------- |
| 260385009 | Negative |
| 10828004  | Positive |

Example:

```json
{
  "system": "http://snomed.info/sct",
  "code": "260385009",
  "display": "Negative"
}
```

## Type of Swab ([Snomed](http://snomed.info/sct))

> **FHIR Mapping**: Specimen.type.coding[0].{ system, code, display }

<table>
<thead>
  <tr>
    <th>Type</th>
    <th>Code</th>
    <th>Display</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td rowspan="2">"PCR"</td>
    <td>258500001</td>
    <td>Nasopharyngeal swab</td>
  </tr>
  <tr>
    <td>119342007</td>
    <td>Saliva specimen</td>
  </tr>
  <tr>
    <td>"ART"</td>
    <td rowspan="2">697989009</td>
    <td rowspan="2">Anterior nares swab</td>
  </tr>
  <tr>
    <td>“LAMP”</td>
  </tr>
  <tr>
    <td>"SER"</td>
    <td>22778000</td>
    <td>Venipuncture</td>
  </tr>
</tbody>
</table>

Example:

```json
{
  "system": "http://snomed.info/sct",
  "code": "258500001",
  "display": "Nasopharyngeal swab"
}
```
