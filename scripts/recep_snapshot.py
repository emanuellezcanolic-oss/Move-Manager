#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Registro automatico de avance — Ventas Recepcion MOVE.
Corre en GitHub Actions cada ~5 dias: lee las 6 planillas de recepcion,
calcula el avance del equipo y agrega un registro a analisis/recep-log.json.
Replica la logica de parseo del dashboard (recepParsear / getCtrl).
"""
import csv, io, json, os, sys, time, datetime, urllib.request

RECEP_CONFIG = [
    {"id": "ara",   "name": "Ara",   "sede": "Lago Puelo", "sheetId": "1fxCZ01-4qmKUt27GvLUBk_vIRR4Jym3W", "gid": "1934895"},
    {"id": "azul",  "name": "Azul",  "sede": "Lago Puelo", "sheetId": "1XpEKL2YvVTfI0YzrWrTii8ZeuTbCTQcW", "gid": "1934895"},
    {"id": "keila", "name": "Keila", "sede": "Bariloche",  "sheetId": "1fxFcaVDcwyeJP01zuF9ngD7e_Il9b8KZ", "gid": "1934895"},
    {"id": "ruben", "name": "Ruben", "sede": "Bariloche",  "sheetId": "1vjxGOb549gQV12gD3_oPZytimSsPTJEl", "gid": "1934895"},
    {"id": "tani",  "name": "Tani",  "sede": "El Bolson",  "sheetId": "1olzZWq8VgdUo63M6P6_U8Br8l-SPw_PO", "gid": "1934895"},
    {"id": "lucia", "name": "Lucia", "sede": "El Bolson",  "sheetId": "1LTKqNKK9emHZ6GjH6Db80H_T96NUqFxc", "gid": "1934895"},
]
MESES = ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"]
MESES_FULL = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]
OBJ = {"ventas": 20, "planes3m": 10, "indumentaria": 5, "mensajes": 100, "prueba": 2}
METRICS = [("ventas", 20), ("planes3m", 10), ("indumentaria", 5), ("mensajes", 100), ("prueba", 2)]
LOG_PATH = os.path.join(os.path.dirname(__file__), "..", "analisis", "recep-log.json")


def fetch_csv(sheet_id, gid):
    url = "https://docs.google.com/spreadsheets/d/%s/export?format=csv&gid=%s&t=%d" % (sheet_id, gid, int(time.time()))
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (MOVE-bot)"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "replace")


def to_rows(text):
    return list(csv.reader(io.StringIO(text)))


def cell(row, i):
    return row[i] if i < len(row) else ""


def parse(text):
    lines = to_rows(text)
    start = 0
    for i, ln in enumerate(lines):
        if "control de ventas" in " ".join(ln).lower():
            start = i
            break
    rows = {"ventas": -1, "planes3m": -1, "indumentaria": -1, "mensajes": -1, "prueba": -1, "puntaje": -1}
    for i in range(start, min(start + 80, len(lines))):
        c = (cell(lines[i], 1) or cell(lines[i], 0) or "").lower().strip()
        if rows["ventas"] < 0 and ("ventas de nuevos" in c or "ventas nuevos" in c): rows["ventas"] = i
        elif rows["planes3m"] < 0 and ("planes de 3" in c or "plan de 3" in c): rows["planes3m"] = i
        elif rows["indumentaria"] < 0 and ("indumentaria" in c or "venta de indum" in c): rows["indumentaria"] = i
        elif rows["mensajes"] < 0 and ("mensajes enviados" in c or ("mensajes" in c and "enviad" in c)): rows["mensajes"] = i
        elif rows["prueba"] < 0 and ("dias de prueba" in c or "días de prueba" in c): rows["prueba"] = i
        elif rows["puntaje"] < 0 and "puntaje" in c: rows["puntaje"] = i
        if all(v >= 0 for v in rows.values()):
            break

    def get_ctrl(row_idx, mes_idx, sin_obj=False):
        if row_idx < 0:
            return None
        bloque = mes_idx // 4
        mes_en_bloque = mes_idx % 4
        col = 2 + mes_en_bloque * 2 + (0 if sin_obj else 1)
        target = row_idx
        if bloque > 0:
            base = (cell(lines[row_idx], 1) or cell(lines[row_idx], 0) or "").lower().strip()
            base = " ".join(base.split())
            count = 0
            for i in range(row_idx + 1, len(lines)):
                c2 = (cell(lines[i], 1) or cell(lines[i], 0) or "").lower().strip()
                c2 = " ".join(c2.split())
                if len(c2) > 4 and (c2 == base or base.startswith(c2[:min(8, len(c2))])):
                    count += 1
                    if count == bloque:
                        target = i
                        break
        v = cell(lines[target], col).strip()
        v = v.replace("#DIV/0!", "").replace("0.00 €", "0")
        if v == "" or v == "\\#DIV/0\\!":
            return None
        cleaned = "".join(ch for ch in v if ch.isdigit() or ch in ".-")
        try:
            return float(cleaned)
        except ValueError:
            return None

    out = []
    for i in range(12):
        out.append({
            "mes": i,
            "ventas": get_ctrl(rows["ventas"], i),
            "planes3m": get_ctrl(rows["planes3m"], i),
            "indumentaria": get_ctrl(rows["indumentaria"], i),
            "mensajes": get_ctrl(rows["mensajes"], i),
            "prueba": get_ctrl(rows["prueba"], i),
            "puntaje": get_ctrl(rows["puntaje"], i, True),
        })
    return out


def num(v):
    return v if isinstance(v, (int, float)) else 0


def main():
    data = []
    for r in RECEP_CONFIG:
        try:
            data.append({"cfg": r, "datos": parse(fetch_csv(r["sheetId"], r["gid"]))})
        except Exception as e:
            sys.stderr.write("WARN %s: %s\n" % (r["name"], e))
            data.append({"cfg": r, "datos": None})

    def team_ventas(idx):
        t = 0
        for x in data:
            if x["datos"] and x["datos"][idx]["ventas"] is not None:
                t += x["datos"][idx]["ventas"]
        return t

    mi = None
    for i in range(11, -1, -1):
        if team_ventas(i) > 5:
            mi = i
            break
    if mi is None:
        for i in range(11, -1, -1):
            if team_ventas(i) > 0:
                mi = i
                break
    if mi is None:
        mi = datetime.date.today().month - 1

    cumpls, ventas_acum, puntajes = [], 0, []
    for x in data:
        d = x["datos"][mi] if x["datos"] else None
        real = d and ((num(d["ventas"]) > 0) or (num(d["puntaje"]) > 0) or (num(d["mensajes"]) > 0))
        if not real:
            continue
        s = sum(min(num(d[k]) / obj, 1) for k, obj in METRICS)
        cumpls.append(round(s / len(METRICS) * 100))
        ventas_acum += num(d["ventas"])
        if d["puntaje"] is not None:
            puntajes.append(d["puntaje"])

    if not cumpls:
        print("Sin datos del equipo; no se registra.")
        return

    avance = round(sum(cumpls) / len(cumpls))
    ventas_acum = int(round(ventas_acum))
    punt_prom = round(sum(puntajes) / len(puntajes)) if puntajes else None

    # Cargar log existente
    log = []
    if os.path.exists(LOG_PATH):
        try:
            with open(LOG_PATH, "r", encoding="utf-8") as f:
                log = json.load(f) or []
        except Exception:
            log = []

    now = datetime.datetime.now()
    ts = int(now.timestamp() * 1000)
    hoy = "%d/%d/%d" % (now.day, now.month, now.year)
    # Evitar duplicado el mismo dia
    if log and log[-1].get("fecha") == hoy:
        log[-1].update({"avance": avance, "ventasAcum": ventas_acum, "puntProm": punt_prom, "mes": MESES_FULL[mi], "auto": True})
    else:
        log.append({"ts": ts, "fecha": hoy, "mes": MESES_FULL[mi],
                    "avance": avance, "ventasAcum": ventas_acum, "puntProm": punt_prom, "auto": True})
    log = log[-60:]

    os.makedirs(os.path.dirname(LOG_PATH), exist_ok=True)
    with open(LOG_PATH, "w", encoding="utf-8") as f:
        json.dump(log, f, ensure_ascii=False, indent=2)
    print("Registro OK: %s %s · avance %d%% · ventas %d · puntaje %s" %
          (hoy, MESES_FULL[mi], avance, ventas_acum, punt_prom))


if __name__ == "__main__":
    main()
