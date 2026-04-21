import { useState } from "react";

export function calcularViabilidad(f) {
  // Si el tipo no es Gobierno Regional, la sección de iniciativas previas no aplica
  if (f.tipo_organismo === "GORE") {
    if (f.iniciativas_previas === true) return null;
  }
  if (f.cbr === false) return false;
  if (f.rol_avaluo === false) return false;
  if (f.propiedad_municipal === false && f.comodato === false) return false;
  if (f.permiso_edificacion === true) {
    if (f.tipo_terreno === "rural" && f.ifc === false) return false;
    if (f.tipo_terreno === "urbano" && f.zonificacion === false) return false;
  }
  if (f.pladeco === false) return false;
  if (f.pladeco === true) return true;
  return null;
}

function descargarWord(ficha) {
  const viable = calcularViabilidad(ficha);

  // Casilla marcada (☑) o vacía (☐)
  const chk = (marcado) => marcado ? "&#9746;" : "&#9744;";

  // Fila con pregunta a la izquierda y casillas Si/No a la derecha
  const filaSiNo = (pregunta, valor) => `
    <tr>
      <td style="padding:6px 8px 6px 0;vertical-align:top;width:75%">${pregunta}</td>
      <td style="padding:6px 0;white-space:nowrap;text-align:center;width:12%">Si ${chk(valor === true)}</td>
      <td style="padding:6px 0;white-space:nowrap;text-align:center;width:13%">No ${chk(valor === false)}</td>
    </tr>`;

  const LOGO_B64 = "iVBORw0KGgoAAAANSUhEUgAAAZwAAAB+CAYAAAAQuqcEAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAIdUAACHVAQSctJ0AAEd9SURBVHhe7Z0JeBzFmfeVPb7sbrJLOOyZISxXiI+ZMWBrxuFIICSEBbKBkIQsOUkIkHCGM4RwmCsJ4SYQwGAwtmZkWz40I58y2MaWZiTbso3v+74PyYdk63Z/T/Xo7an+V/V0dWsky7h/z/N/7Kl6663qmp731Ux3VxUU5ImT+38Y8oVjzwXCxXP9oeKt/nCs+fQBxZoTBULFLYFQfIM/FJvRu3/8+9jHicDJ54440x+OPxEIFVf5w8Vr/QNitYFQrA3nykr+UHx/IBxb5w/HUr1Cox4KBEeciX14eHh49Gh6h4vPD4SKlANflyoUj5/WryiAYzxeCATjPxOO6ZgpdtQfjj3Yq1fJF3GcHh4eHt2KGKB6pgLh2Aoce0/CF4ofxjH3VAXCsZ04fg8PD48u4/Rg7m8zN9/9iTa2bIPW3NKmdSXNzW3aWx+s0C6/fpIwBpkCoeKDeCzHipPPHXoSjg/V56Kx2h+ematt3lqPh55X9uxr1IbFVmk//PXH2pfPF8dhJTwmDw8Pj7wSCMeOYuBpbW3HGHZMOXr0qLZizX4hQPaUQBkIxVtwTExLltfiofQIjhxp1fpcVCKMtyfMpYeHx2cUX6g4xgcbp7S2H9VW7dytzVy9Vxs1f6/22swdWnr9ITTTJnxaq/1u1AZdd4/ZoD01eav2buVu7aOVB7T1exu1o9hAgZ4SKHEcN90+E4eak6aWdm3DvsNa1fq92rTl+7XRNXu1Yend2uuzdmgvTN+iPV++UXtu6kb9/2/N3qXF5u3V5m08pC3dfkjbdbAZ3bni7MLRPWIuPTw8PsPkSjbsW8WrM7YZicKNkLdm7xRscmn5jsP6OKw4e9CxDZS+fvYJu6G5VTgut9qwr9Hk+9V+v9JePOunlmJMX3FA+3jV/pzzyBgxZo1xHP5Q7CE8Vg8PD49OQQHm6h9PNQLPyGpnSUFFyF2jRZtcevGj7ejCgA/4gWB8Nx5jV2KVbB4ct1Q4hs6Ip621TUgsVnqt/y16mx0HmgWfR5rF63HHMnl7eHh8xqHg8knlDow9Bg9P2CQEK7fiYX9xY72dsD3BB0pfeOS9eJxdBfU5OrFeH8fdo/OXaF6dYX5PKl4cIyQUFS0bP0dv/2hys9AHE4+XcDw8PLoMCi7t7ZngvWHnWFMAQorn7xUCllP9fdZOk0+st5MV3R0s/aGiNdQf45XyD4SxulFtQ4vpuF756i+FJOJUBPbF9JfybUZ9d8+hh4fHCQQfMBllVYMF1R/eZNTzYOByKv6KwrLtDUJ9LsloazvarQGT74uBY3SjQ42Zn7nqNuwUkkZnRWCf95ZsNOq6c/48PDxOMFQSDq+6+mWGLYEBzIneqdhl+Gl3+BObjDsfqTQCpi8c24LHm0+on/diq7S2NvEaiRuNXbhPPw5MFvnQK31u1n2/+Yn5Gh27a5DwEo6Hh0eX4TThkGZ9mv2LmcDg6URu/cgwB80h/4THnA98odh+fu6Gz/qFMDY3emBc5tskJot8qb018w2K7/OO0dl5/O8LR3kJx8PDI/986ezYWW4TDmnGoh8abRnPl28XgqiqeLAulxB2M0FX/6XO+3c63ly6p+PnLUwU+RSj9nCLqV9i4LcmdOm8eXh4nKD4+8cu62zCIe09UGP4YGAgVRV/5xnWWem+sdlrEAS/NM6pfYb3w2PvLOT7gSeqHY1VRQxMEvnUhtmLhTETV/5oipdwPDw88o8/FP9lvhIOiQcDqarc+GjruMuOh/8WgsfeGfyhWJKft0+WPW302dDUpn2Q3iOMz4kYmCTyLcb+w9kHUombbp/RJXPm4eFxghMIxp/lA2dza72QQNyosTlz4Zvx56nuVipw800HeeXtpUbw7HXWcD8ev1v4RJYZ3zrs2qCUW9JHVYwXzxaTRD7VVH9E7wfnbsjfaryE4+HhkX98wfgEPnDur18hJA+3Si+/ywhi4xfuE4Kqigj+L/FcemrSFqMNwScHPH63kL/fP16l98H6xmdnkHtLxPFaiZF+fYKQJPItBt8nY/ykDXmfLw8PDw92p9VqPuFs3TNNSBykease1pZseEGbveRmoc5KU+Z9ywhkFWsPCoFVRcRDiqsdIN+/eXpeA6g/GJvOz9nm3VP1fodM2mrqt+5wq+k1I73hkDBemRiHdtUKCSLfYrz0ceYmD2LthoN5nS8PDw8PHf6vf8bKLe+aEoYdew8sFJKMTARbTRqDq4oILJeJrdGG8MeJc+AUnDPq905Jv4yVOw+bXqssE0Rggsi3GPSTH0++5srDw8PDAIPngrVP6glid13mpyJVJlZdLCQZs75m2Lq5plPbkP22gHUyIV2RcC773kRhPFY8OyW7dAwDx4vaXJtZERoTRL7FYA/e4tjzNVceHh4eBphw0svvMQWelsONQpDCgEVMX3CdJNFkNXXelYYtBlgVEXdI6lDPTDH/vHWksdU4zpPOGn42zoMq/nD8SX6+6uqXS8eIsBsgRlbvNl7jeJm21DYa/38smbkWhfOdb/Fj4fESjoeHR97BhLPv4EIj6LwevEUIUDItHTvbaINJBrV80xuGLQZcOz00PrueG9bJhGSPNXYU50EVnK+nEjFTn805dkl9LLnZ+P+7Hd8qSPVN2W0C+PG/Fb1TmO986UhdZpM82XxlE87rn8c58PDw8HAFBlDipXN/LgSoXNo4Z4nRFpMMqq29ybDFJGEn4rEy+TL7vA7ARfuzBmY3asN5UIXaf/cn03Sf2Cc/RhlUv2LnEcOerb7Nw54n4v3gXOdLjE37mqTjpuP09ymK4hx4eHh4uEKWcOo2ululmEgtv0NIMihiKPylryICy2VC6Fh7nffhV3Au7Dg9aP45jYH9MS3cWm/qk+e9yt3axn2N2tyN9ZZjpPK6jutWOM/50NGOh2St5oqOs3eo6FacB4/8EwjHxgWC8Qb+84jyB2OLe4VGXoJtPTyOG2QJB4OTExGYYGQiMGDbyUk7hD9enAs7cK7e+fhRoT/S3vpm7NqA1T8xcYt0fOiHMfJ7jwvz3BmV3fV33e8jpea75XiMIBeKvYHz4JZAn/hpGETtdGrfYX3RTz4IhGM7sS87oY/O4A/H3kP/btQrWPJF9O0WX7hoIfq3UyAcq0c/+Qb7VFHvfkUXoR8E26gIfaiAPlSEPjoL+ncifyieQH+u4R0TGKCciMDkItPeA/N1W/a3NgbaXHqiLHNBXWW30JY283I3/PHiXNiBc4V9odhzQzKoftmOBmk5LwLnuTOy6o+HjjMQjE3CeXALnsiqQj+dpXco/ifsQ0W+YNFK9OWUQCjWin7zoUB45HewL6egT1Whn3zSu2/RddifqtAXjy8UN1Z6dyr0ZQe2V5EvVFyKftyCvt3otH5FAfTrCt4pY967k4QA5UQEJhcrESp3nsmCI5aj8Jmcj+dsM44X5yIXp/UrGkTtWjtuDPjHbPOupTxrdmev0TD9bfp2rXzFfuMWZP4YGDhuXoz6XXXCXLtRrv74tejoWH3h+CKcC7fgSexE6KszoG8nQl+qBMKxFeirK1RQUPA57FsV9KWqk88dehL6yhe+UPFQ7E9V6IsHbZ2od78RF6O/XGB7VaEft6Bft0K/riBnZw0apQeakp//VQhSTkRMmXeFkFxkmlx9udEGA2Au0XM5r88ybyQmE0LH7A/GN+B8WMFPPKO1LbMOmR10AwCKD+5Yh5rwaa1ut3xChTDfTlT+p/dz9re3Prs0Dx1rIBjfjXPhFjyBnQh9uSUQirWhbydCfyqgj65W71DR8zgGFdCPqk60hGPnG8G2qkI/bvCFil1/k0Ohb1eQs0uuLTOCDbFg+DQhaNmJYA96YnKxEvHUpK1CEMwlAstRbBdRHjeTSPbnFo42/NR+/Ik2+6TTpVp8/Y9NfeKYiFdmqO0dtH5P5kFQBs65qhhNre2Cb9LqXdkk6maO7MAT2KnQnxvQp1OhPzuwfXfJHyqqw7HYgT5UdSImHF8oHkefVmBbVaEfN6DPzqjAN/IL6N8x5OzG33xsBBuktalZCF5WIjCp2InAIJhLqm0eTWSff2Fc8M3x2UlU4Iv+93uRPSUvTDBWqp2RfUaJxrO1zt1t4fePM+/5w+40q3ipRHgPZNpWs9q2v+qN2bvrTCdansAT2Kl6h+J/QZ9OQH9uhD5zgW27W75gfCuOKRfYXlUnYsJhQp9WYDtVoR83oM/OKBCOt6N/x5Cz+5/ILGVDAervA27VjrabH2LEICYTsmDtU0JykYm4x8GKyocaMw9LqtxazdPent0N9NS+xRGcE+T0cLyd7BnzLrpMSCy5NP+i7AKm/Fj48T1fvk0bU7NXG1G9R1+TDcfPi13v2nHA+i648keHSd+XxhbrbzdMpYszP90x+BMN58MteAK7EfpU5b/OeO8U9OVG6NcKbHes1Ltf0Q04NiuwrapO1IRzekgtAAvtFIV+nIL+8iHswzHk6KV/ZB7cxECFSQTrrOwQtmo0Jhlek+e6u5aj2gZxMom8LQMTiooOzl+AQ1DiofEbhWOR6e7R4h15DP692X6gWWjH603uJggn86MKnrxu5AvFjqBfFdCPW6FfGV11J5pb4fiswHaqOmETjk0fBLZRFfpxCvrLh3x9Rp6D/TiCHMXHZzYQwyRC4r/tYB3T3Lez14CobNof3jXKGLWHlgiJRvYtBwNhLqm2WbLdvGIzP4k4JybOGvJvZMeW7WdgMlFVLtY+/JhWc+mV2qfX/kDbO3U6VgvHY6eXP95htOX/GEA7Xo913G7OUJ4fB+DJ61bo1w5fMFaEPtwKfQucMebfsU1PEA5TBrZR1YmccJjQN4L2qkI/TkF/+RL24whyMrNyuxGcrESMu/lvpvLyxz4w6rANU+K3rxn1e/bPFxINac22D3UbdgMXBkMr0a6gWC4Tz3tFK5UmkJ9oxvb3RwiJRFUa3LywPz1XsEHxif6uMeIx2YnxxoW3a4tHzdT/j/UoIm8nGAeeuJ0R+s4Ftu2M0DeC9j1FOE4Z2EZVXsLJDdqrCv04IRCKL0V/+RL25QhysnLNfj3QYLLg9cF3/mAEJCrjeXPgb4U2pNf6/9qww0TTmW85JQsyW1nvOtgi1KEQOnZf//hTOC8EP9EMTAhOtHdSZv01xsIrvyfUW2npz24x2uEx2Ymg9+rRZO416Ii8nWAceOJ2RqcNiBeifxn+cKwJ23ZG6B9B+x6jsP2CtUIbRZ3oCYcJ/fOgrarQjxPQVz6FfTmCnBw4lLkIjYkCZQXayVQzbIphj4kGEw5bGRqDoZUILEfRtyFCZRKpfurHmZ+bMBk40YGqubqP9pYWoc5ONZd82xg3HpedGEXXPa7UnlCZG6fgidtZoX+Rkn/GNp0V9sDD31zSWQVCsT2+cGwLSxRY51Y4XgTtVeUlnGLtpL6jLLc8QVtVoR8noK98iv0Rh/0pQ04ITBIoZP0nnwo2uURYPaczee43DRsMhlZStU9yd2Ex+EnEeWHwT4cz6pcsFRKBExFYrqq2hsx1qGnL9wvHlkvER08M1//FepntFTdMzjk3bsATt7PyhUbmXAUB7fMh7IMHbd0IfRKn9R8xEG2dyheOPYJ+edBeVV7CyQj7INBOVehHFX+oeAf6yrewT2XIAYEJAkWM+O6fhDoV1a7PXszGZIPfcjAYWsmJPU/Np3tyTiA/wQxMAE5FYLkTEXhcuURbX7949s/0f9nKBWhDIh54sjrn3LgBT9p8CPsgTusTuwZt8yHsh/D5Rn4BbR0pXLwXfcoQ2jkU+uNBW1V5CScjX3jkvdgPA+1UhX5UQT9dIdcPgZIDAhMEing9rLY5m0wEJhpSc0vmbjC2+CUGRJmmr8xcfypbUifUoRA6/l7BkVdbzc1bw5frthj8nYrRcuCAUO5E7a2ZJX3wuOyEYD3ajSxZkz258gSetPkQW6oG+2GgXb6E/RCdvVaE/qzwh2I/wLZOhP540FZVXsLJCvthoI2q0I8q6MdOvYPxGiyzUyBcrPQMkgA5YLAn1zE5oAgsdyICE013fMtB+Enk56V3cORKfm5a6uqE4O9ER9syD6liuVPN6X2O7qdi7UHh2HLphenb9HY0/1aLpRJzF+b+9ucGPGnzpYKCIf/E9+MLxzejTb7E98ODdk7UO1x8PvrLBbZ3IvTFg7aq8hJOVr5wcUW++kI/KviC8Qnox06sHZapCPu25d/7DjudGjPaWlqF5IAisNyJCEwy3ZFwpizPfBsirCaQL2dg4HcqAsvdiGG1KGgu6e1asrugYj3ZMNasPyCdl86AJ2w+dSz64UE7J0JfdpweLHK9AGmvUNGd6I9AW1V5CcesfPWFflRAHypi7Xzh4mlYbifs2xZ///i11JjRcqRRSA68Xu33KyMgYZ0TEZhkuiPh8LaMO/9QKZ1AKrvqxsyddRj0nYrAcjci8LjstG1/Zg23eUMnWbYn9uxrlM5LZ8ATNp8KBItv6+o+mPCYCLRzIvSlAvpQVSBcvAl9EWirKi/hmBUIxQ7koy/ehyroQ0Vu2waCsT3m3m3wB+NPUGNG06EGITnIEsUrfX4p1KnqwNY9HV6OCkmGV2r5nbrVltpGISjK5PYBUAZOvD9YPISfFwYGfSf69Ls/0n1se2eYUOdGBB6XihgTbn1J/3fepkPSegbb8wfnpbPgCZtvFRQM+Rcsy7fwmAi0U5U/VFSLvlRAP06Evgi0U5WXcETloy/ehwr+cHwm+rAT/3M01qnIPAIb2Nah1JBxpO6QnhTK/zjMCDwyMIk4EYEJRiYCg6JM05bX6bbVG8UgikJoDgKhWDWbF35CGfMv/bYQ9FW04IprTQkC692K4eYnNf7YmxsyWxFY1TOMk+q8KZ/Hc8cNeLIej8JjYpwyoOgMtFPVqX3i/dCfCujHidAXgXaq8hKOXJ3tyzxie7C9ijrf3nz9NCeBUGwjNWTU7z1gCji5OLB1r5BM7FS7LrN8DgOTi0wEBkUrMdj2AViOsnsAlP5/2XUT9XoM+HZqb848RLt7XKmRINz4sRJjwZZ64bhUdPeYzDxR8mdbN/D1PDQPp5xX9F947rgBT9bjUXhMDH//+B1op6qCwND/QH8qoB8nQl8E2qnKSzhyFRRo+u6rWK4qHLMd2F5FfHtfKPa/WK8g9bvVAuG48YAQY19HQmhvbxeSBdPrwewSKwTaWGniPW8YbTCxWKm93dktwASWo9iaZDz8BPpC8e/xc8LAgJ9LPHwZS3L0f2zjROy2agYekxMx2JbVBNYRNA+BPvHT8Nxxg+RkPe6Ex8QIBIveRjtVoS9V0I8ToS8C7VTlJRxrdaYvHHMu/MGYcRlAVYF+xe+gH7RREfqwxD8gVkuNGHWbtusLPWKyQA27/AFTYMJ6VHNDdrdKxtyV9wvJRaZFa5/V7VfsPCwETZkILJeJZ/zkjcIk0pysvPs+IehbCWFle6eU6/+vOKOPyQbbqorA43Ei2t6avTeM58uzu47y0Dz4B8SuwXPHDTi/x6PwmBhubkXN5U8F9ONE6ItAO1V5CcdaX+wTPw3LVIVjzgW2VRH6YKCNitCHJb5Q/DA1Yrx7lfXim4LOyTy1TqyZNt9U/2rfX2l1G7P7q8jABCMTg307wKApE4HlMvEw/ziJNCcY8K20e1zC5LO1vt6UIHS7k79sfu1CBB6PUzHY+4Q3W/DQPARCo17Cc8cNOL/HSr2CsbuwTFV4TAx/MDYd7VSFvlRBP06Evgi0U5WXcLpGOOZcYFsVoQ+GL1h0BO3s5A/HP0U/UthT2tSIApATvX3R3aYAlYsXz860GXrp703lmGBQBAZMmQ41Zn6Cs1sRmQnBSaRAPC/yDSHoy4RgOft/bfkM43VbY6Pgw07rn/qL3pbtDIrH41SM2nU79PeE0dSxGyhP9oQqzrlmmSo4x6rqTFuZOuMPj4nhD8cnop2q0Jcq6MeJ0BeBdqo6kRJOd26uh2O2IhAuehbb2sti9fBeb35RtLUXupHCN2BgQlFRLnYuXifYY7ujNrdHExgwZYrPy9xyXbnO/k61vfUthm8GTiCjcds27ci6DULgl6n6/IsMX5tfeUMvqzyrv/66fsky/TWCPuxE4LG4UWtbZp8d9l5UvZn5dob7hTo+oWzAOVYVa+sPx9diuRvlYyxIIFw8Au1Uhb5UQT9OhL4ItFPViZRwOtPWqXDMVmA7FeW6WQVtVYQ+pPANKPg4FXsmh8A6OxHLNr4mJBo3CYdJ1f6NT8w/9+EEEmwDNAz8qmo7nFndGRMGgfZ2IvBY3GhPR8Kl92LUj5/hRpbB8QllA86xqjrbnuQPFzV31pdxMBy9Q7HH0U5VbAsF9KcC+nEi9EWgnapOtITj5+7u7UrhmK3AdipCHzxoqyJ/qGgj+hHgG/DBx6kILLfT66HfGG1Zcpm76gEh4TQc2azX/zGhtpAngeUy8Vx0ddKYi117Ms+oEBj4VYXta6dndt3EchXRop3stmY8DjeinwzxPVm/N3uDB39+4LnjBjxJVUXtT/rq++dinRPlcyw8vv4jv4Z2qjrlvHfPQH8qoB8nQl8E2qnqREs4nWnvROYRyzmtv7tV0dEPjy8cfxftVYR+BHhjWfBRFYHlKiLY/jgrNr8lJJzF65/X6ycssl5SnxeB5TLxpGt2m+airS37AxMGf1XJ2u+bUq4/p4O2E786WCiT+cJjcCtGzQdThfejnFtrztHJpACeoKrKhw9fKG668QHrVcX74EE7VflDsQ/Qlwrox4nQF4F2qjoRE44vXPwo1uVb5hHLwTbHUjg2Ad6YgcFHVQSWq2jxqMxf/U3NddqWPVO1mlV/MiWcyXMv1+vrGuy3kKZAysBymRB+Lti/xRPW6f9f9D/XCwnATst+eZvedu0jTwp1MqXWHxTKSOxnPcZLH20TjsGN6LlXfC+Y+J8aHZ1MCuAJqqp8+MmHD5kfAu2cCH2pgD5U5QvHG9EXgbaqOhETTmd8qIrvywpscywVCMfH4/hM8MZWAUhFBJar6KWv/Nxov/fAfP1f/JZDYOCUyY3tis3/0P9l87Bh8yHj/zQvDEwCdnLaLpctgeOXibEwxyoE6/dmfi58K3qn8R58ePUfjT4eK8tspc3gzw88d9yAJ6iq0E8gGN+ANrlUUDD0X9EH2qgK/RBo50Toy45AqPg+9KGqQChegv4ItFXViZpwThoQPxnr8ym+Lxm9Ork3UlcIx2iCN2RgMlDRm4N+awQorFMVcaBhtf5vdycc6oPmgf7Pv8YkYCen7axsifvGbRTGLxOB5UwtHXemrZpcrc/7/i27DXvGPWM2aA9P2GS8Vj6RFMGTU1Xoh4E2uYRtGWijKvRDoJ0ToS87sL0ToS8etFXViZpwOuNHRdgXgvY9QThGE7whAxOBiogPvvOwUKeil87NfsM53JjZfnra/KtcJ5y3Z2d+Epq/2fqvfNKMVZnrFcs3van/S/PQ75Ixxrz8+t7ZetnhdeuFZJBLDNVnbSbOXKnbY/m29z7Uy9sVFur8W8cGa8SuQ83a6Jp9Rn1TaybZzHymyGRHz9+Q7i3ZaNQpn0iK4MmpKvTD6BWMfx3tZMJ2BNqpCv0QaOdEVruWWoHtnQh98aCtqk7khMMWr0SbfAl7QtC+J8jfPz4Rx2nAGzIwGdip+u0yIzhhnaoWjpieCXzNdVpLa4Phz23CocUpG5rbhDoU/TXf0LhFS6+4R3tjWGYraZxEAhOClWpnfKLbV/UdKNTJRHzyJXk5jlumZTsyt2DzPDd1q1GPfJDeI/hA269+rcSYAzx33IDzqir0Q6AdyheOl2MbAm1VhX6I/+wf/yraOlGu5yJ4sJ1ToT8etFXViZ1w3PuyE/bD84VzR/ZG+54iHKsBGfS/dKwRZDAhWOmdS+412qjsFGolgt2lxuM24fABE8tlIvh+cAJfeHNxpqJjAU47EVhuJcP+lDOEsodL1W4Hx+OZvfaAtPzO0WIbFDHo2xPsTyIH4LyqCv3woG0+2uUS+uFBW6fy9R11NvrkCYRjR7GNE/mCxXXokwftVeUPxh70BYvvcqPe4fj3cRw8x0PCYaBdPoR98KBtTxKO1YAMbr4787MR8VrwFiEx8Fo3Y6HJnoE2Knqt/6+N9nzAp9fHIuFcfG2pMIFMxPyLrhASBorAcpmm/+Yh3XZW5XZt9n+fbWrPLvDjeHOJ/fRGYJ0TEZddN8n+JHIAzqmq0A9PIFRUj/ZMXzh/fG+05UF7VaEfHrR1q159R11CPtmFaX841oQ2bmQerQjad6dwLMTxknACofhBtO2ssA8etO1J8oXiT+F4dcjgtaFLjSDDs3TcbFOC2Dpvlak+9do402tMKHYiqlbcJySc/fUruz3hfLTgemHyeBH8NxHUwiu/p9scrFkk1MlE3P9ElTb71xcbr91ssMbTmQdEiZ/fMcs4djx33IDzqSr0g6C95TpRHGIbNaEfHvbXOtr3JOF4EbTvTvXuF78Yx8M4XhIOA207K/RPnNy/OIS2PU04Zh2qnFOVudDOX8C3Q5Y4sDyXeDCx2JW/8FF2Of0Hxm/Spq/cr702c6cQMDGQykRQXzhxvKJXZVeEnnvBRULy4BPI3AsvFupkIq79yTRtz5o5+v9VNpFDEUVPZhLeYYVrWFYiXn93We4TyCE4n6pCP4i/78gfOrFnYB+qQj8I2vcU+YKxX+FYEWzTnfKF4jfheBjHU8LxBWNz0L4zQv8E2vVE4Zh1qPJwxyrLLBEsLs6uaNzaZF7gctzNfxMShyyBlN72ilBPmvtO9kYDHllikZURf0pmlrxBVu3KLkuDgVQmQiXhMH3nxilGG8aiq7+vJ46DczPPEBE7RsSF5IKaeuYA3fbPry7SvhIdrTU27daOuEwUBCUcBtqoiqian119Ac8dN+Bcqgr9yOgVKrrq9HDsaEGw5P9hnQzsQ1XoB/GF4g9jm54gHKcMbNOd+iwkHAbad0bom0C7nqhAKPYHHLcx8JaW7MrBfPLAZGEnJ7Q0Nutt2lvbsMqgra1J/5e/Lfjesdnbdom35+zSVu0S79LCQMqLPXNyx2jzz1A8X4lmb42WSQVMMKjGpsyYeZ84ThURLNkwtbVktrhGO1URra3txtjw3HEDzqGq0E8+wD5UhX5kYJtjrV7BMefhGGVgu+7UZyXh9B4w5jZs41boO4P2ObTrqcKRG5POL1XfmYSjmnRePu8XpjatzeZvUohVQDzSbH6GhK9jPDlxi1BftT6zkoAKOIEyPTikyrBf37FKAQ8mGRItV8MgXwwcr51Y4mQwf5RwYkOu18tS6+23aZCJx/LkcQHOnarQTz7APlSFfqzAdsdKbP8WHJsV2LY79VlJOAxs41bolxEIx9vRTlXoSwX04UToy3BGdzdh0sBkoiJKHq0d32CGXfGgFr9hiGCHygUGxAWbM8/rYDkGS9pKefG2w/q3mancwpTsQUj+rq5HSrObtr0xK7ue2FMvLBAmUkV2sOs0jE1bD5na4PHYiaBkQyLQXkU8NDY8d9yAc6Qq9JMPsA9VoR8r/MHim7HtsRCOKxfYtjv1WUo4p5xXdAa2cyP0y0AbJ0JfKvjC8RfRj6p69Y3/0OSMKnCpegKTgpLOzm49LdTl0BsX3G60QzAgshsFZOVMD3XU5YK3v6MjwKIfBCdTRV8dXIJuDHbuXaH/y9szcBy59IfS7LF6CccZ2Ieq0E8ufP2LpmH77hSOxw5s3536LCUcBrZzI/RZcHLJSWjjQO3oThWJL2UZTk46M7vwHEHBH187ldv2VmBAzKUHOxJOfVObdlfHQ45vcisgtzq83ZiWhGHgZHZGMp8M7D+XCEw2TKvmTtLrZD8r2omHxubrM/Ic01noApwDVaGffIB9qAr92OHrX3wL+ugO4ThUQB/dqc9awmFgW6fKpz/fuSNzPpeWC/TlRIaTXsGR51EhwYL+68FbTK/dyG17HvalCwOhip4vt17Cf/v+Ju2ZydnlXlRF4GR2RjKfDOzbSo90fLs5cqhOSDad/ZbDQ2Pz949dYzoLXYBzoCr0kw+wD1WhH1XQT1fJFyzai32rgr66U5/FhNPZlSHQH9Y7EfpyQiAYb0F/6opfqTvx9S82dikk+KA/7ZH3hISgKt6fE/FgEDyWauy4i++cyGjJhDrXi28ndX/X/GSaqVz1uGsPZ2+ywCTTVQmndzB2P56ITsF5UBX6yQfYh4oC4fgh9OOEQDj+IfrMp7A/p6C/7tRp/YoG4XgYvlDx02irKvTFg7aqQj92YHtVBUIx4VxDGydCX05Bf6ryB+PbdAf+/iOupUJi1l/ixv8xGaiqM9sV8GAQ7E7x6409MF6+enJnZOVP5bifnpzdr2bLiiohyfCia3P006KqeGhsgXDRW3gSOsUfLtqOx2wn9lci+skH2I+K0Idbeodif0XfbuUPx5rRv1vQd3cKx8KDtiry2czLaf2KAthGRejHjt6h+BT0oSL0w0AbVaEfN7j9tubrF/tf3YE/GP8tFTLaWs23JmMyUBVR/ugwoc5OPBgEu1My2DYFOJluRcjKcSwoApOLlQj0k0v83Xs0Nl+4aBqehC75nC8YH6yigoIh/4KN84m/f+ws7FMmf7g4gm3zhT9Y/CM8D+zkD8dnFhQMUXrA1Sn/2W/EqXj8XalT+xb1xTHI6N03NgDbWqmgoOSfsb0V7L3F9jKd8tUxX8a2TvAHi4LoUyarb3pE7z7F52MbK/UeED8X23cW7COXTA394dhrfKA7uHu7EWQY737990JCUBGB5SpCHppgXin5no69WjBAMuZvst//Rqb7xpo3NmM3GyD4ge+M+l8a033WfLpHqGPfSHB8vHj2bl0tJBeZKsa+aLRBf1Y6cDiz8gSDxuYPF68xnUAeHh4eqgS4r3qMxuY92qot72mfrvuzEWwwIdiJ2Ll4vVBnpxlPjTDau2XHgWYheBJYzlS9Mfug5s6DmafzCUwG+VIu/21t1gmHJVSe0X+5SUguMvEMrdgl+JVpS11mhQcGjS0QKnK0SZiHh4eHgT8U28gHwU27yqSLZWJisJKpzdk/E+rtRPBBWeSo1twqPs2/Znd2/bR8gckgX0L/7Elw+n9zS5t2X8lcIQG88UlmJ1QeTCxWQtC3TCt2ZpcJ4seO55CHh4eHEhgEV24ZaiQcTDprps4TEgRp76qtJlsC7XKJ0d6W+SmLxjTg8vHg0bxHDj9GCpSp9QdN9gz2s1wuqC39fEdgosiX0H/vc4p99P+FS/Zpj5eONwV/fstnHkwsVmKwn+omLqnTdzhlzyRhgkHNXHXA6IcfO55DHh4eHkpgEFy07hkhoB9p2mUEHjta2hqERFV0/RNCcuH1zsX3GLatbZlvKRigSWdeOEpbsvHlnAlHpqcmZRLi0u2HhTqZCOw/H0rXfKr7Lrwyu8kb/148NKRae37S342x0CoIDEwkquKxu0ZEGl6122jDjx/PIQ8PDw8l+EDCSK+4S0g4GNitYNtD57Lfu3qrKdHsXi5+65gy71v6vxikcZzYD3tGBgMmr7crMqsMjF9UK9TJRGDf+ZDMN/9efPn8Yu0f5Q8LY4k/fYOQSJyK2LCvUThm1NOTs99acaweHh4ejsFAOHPRj4VE0xlVLss+j5OLNdtG6PblNdfqr/ng5us/8mu+cPEifpx8Hwy7nTGL5+/V7Yaldgt1MtFdavz85EsEvfYH40/ge1E69xF9HDIwiTgV8bjCcjcEPzY8h443ytLRIjxPUdjGw8MjD2AgnDLvCuHDlx9dpDW11BkBjJg89zKT3ccLb9DLZcGNygb/T9KUGAkMlrzemp35WbCkZp9QJ9P9HfvtrFi9X0gYndGvHnhV9/vCm4uNMjw+puqVfzKNh7+GgwlEVSXP/0xbkUqYkg4eN4rgx8a/J8cLyXThIfGctFayKirfj93Dw8M9fCBh4Aevu1Wx9FZTgFMZK4HBktezUzM/D83frP6cDsH321nJfMqOb8Xmt6Xjqdu1QUgkJALLSRuXZrauRrAf7JMhG29PpzRV+Bc8v1CJqsLH4pMGnJysCvsSqcLhVF5SEuySByo9Ok9JSYH33hyvYDDED2R3a8mGF0wBjh9r73B8k2ysBAZLXnThvaFJfetmgp+jzgp9+kNF22XvxfZ9H0vHM+39R4REwicbAut5mztHbdAWbmnQVxKgtQSwL5yDC745wRgb/570RPCcQiVS0S5ZJseja9G0gs/x7yPWexwHyIIh0ti8V1u07lnhg9sV2rQ7qbW1WW9pTOXjyjYYbQgMlihVO7Tn56gzuuCK93V/GzdnN1uTHRtT/RHzygfs2hPD6kFPBOt5GzzOXCJuun2mdMw9hURlpC+eSzIl0oWN2Nbj+MD0XqajpjXSkhXRUGk68qdkOjoqWVUYS1RFpKtOexxj+CDnliUb/iZci3Gr/Q0rLAMyjvdI0269DYHBEqVqR9q2P/Ok/cBvZf+674yOapnVpvky/tgCwXgDleM41+1p1MswifDJZP7k94xjxPrOJpxnX1kkHfOxZkK6cDaeQ6REKroey7C9x/FBaVXh0/heqgj9eBxj+ODHuP6lywXd/NYN2sPxO7TXpv5Vm7NyhtbWnl1jy4rZS24W3nwVsR95Kqp3Wga3QCh2gB8va0NgsESp2pH+mNis26/beFBIHm5E8GWmYwvHdvK2/FiaOzaAwyTCVP7+H/W60ldvM/pAG6uE8+nWBuG4eRHjJm6QjvlYgeeNSamBv5DZJdPRdWYvHj2dRGXhY8L760ATKy+8Fn16HEMoiJw1aLQeWDDZONGG3WuNAEWU11wjnAS5xBhbliu4DfknqjtypNVow8BgiaKg7WSZfoJPEm7FYA9d0uve/UZ+hz8yX/+RlbytbByYRJhWVpUZdYwd6z8VbGQJhwePG20q5+4yxs2P+ViA5wxpYlX0wVy2WMejaufRPSRTkWZ8f2VKVEVaE6nIrNKqC85GHx49EAoig75dqgcWTCJu9bth2XXRmlsOCSeKlRivvL00Z3Cjuv++cJS2ec9EbfPuiXq7D9K5n7F5fVZmLbK6w61CnZUITB5OtWlb5sHT4KVjjTI8Ln9o1B1Ux5CNA5MIn0iI0ldvF2x4u7dmZ7fa5sFj5/vlv+XhuLubZCpSzZ8zyXThjWjDmFhV+E3eDut5VO08ugeMCyi09zhOoCBy1Y1TjOCCyaMzamzJXHtg4EkjE+O+x6tyBjc+kDMmzb1M/7c1xyrLGECx3Eq0eRnfpxsRfBkeV8G5Q0/i7WXjxiQiSzgfDX9MsCG7ffXZn0NH//n/9PLGhuyaaXj8RMPhFutxHwOSqWgZliF4bmE9UVpZuEvF7rNGWSra0lOPOVEZvQ3fv546Vg8HUBD56e9m6oFl5rJpQtLorHjw5EExfvLb3HdE9frKmPOont3aS+0YGDBRqnYkeuBy6/YGIYk4EUGv/aHYajwuBm8vGzcmEVWNe+nXevumw5lVtrG+tSW7LYOsXwaNDcfcU+HPq0QqcgvWE7wde0AU6z+L4OeOCW16CsfLOD0UoCBy75/SelDBZJEP/eDlzPpoBJ5AvBjX/WK6bXCjeraadM2axw3fmDBQbAkcxp+nbhXqrERgElHV7Q9lvj2On5Tr2lQGqsdjYRyq3SkkChW1tmaTSar0NaGexPwTeOwMu7H3NFSDlKrdZwX8zPX0Y+fHWLLMeyD3uIaCyDMvLdSDCiaLfAnBk53E+PYPJtsGNz6gM5paavV/7x0jJgxev+9YsoaBdVYi+D6dSNYej4egenZrOI5h9fypQpKwEw/WydTSlN1TiD92ht3YexJl6ej7qsHUzo49KEr1idTgbntoNJmOzMSyzoKfN7tj7wxl6YhpOSGsVyUfPuwoTUWnYxlPaSryUDIdeRbLu5tEOrqJCcvdUlo1uKSscuDFWN5lUBD5oHi1HlQwUeRLMmoPLRZOesZFVydtg5svHB/JB3Rqy8CEgVK1Ix1uzizkyW8n4EREtixmGbTIZmL5ZqP/x5Jb9PZjX/iFkCCstHbBR0a/29cuFOpzad928W5DBo3tpK/mf4/0fIPnFdbzkE2iqvBxqzqUpV0qEsU6RrLigpBVW6QsNbid7ytZaX7I0S3JVNR05xcry447+m20Z+NIpCJvYTlhjC8VnWVVh0I7O0orC++htol09DDWd5YJ6cLB/PhGlp//BTAxrW7AVFJS8M9g44iyVOE+q/korRxs/HGTrI7cx9fhOPg6guoSlX3/E+t4kunCu1X85R0KIuWzMmuNYaLIh4hXp/xZf/3AyNu5MCau/Hz+5WrLqJDNg09WaVPmZn+2w4SBau+4EQDLrXRPx3Uc/pZmJyLota/vcMtbOMnmz68uMvqfujyz6CkmBivRjQ6ZNtcJ9So6uG+74YOgsfXqV3wXjrunYfow5QiajDGzzz8nUVm4FcvxA8krkRq8xcqWLyf4+tKUdeBMVhUewb6sfDohMefCIO9vYnrQz1g5+3/JrOAX0Z63TaYvuFSoT0WqeBs+CPPfCGUye8qN23Y8udrj2NAO65iS6UgJb4OQ3aS5Qb9Ql44O5X2Vpga9QXWJdLQB+6K60orIDKwr/WTAAMNxQUHBpHmRS2RtkTHp4CnoK5d9XqEgsnRl5icpTBZO9KNXr9R+8vdrtZvf+r5267s/1u58/+faks2Zn+pkvnnooBnnRsYYwQ3HyyML6ow/lGZ27cwlBovLWG4lgu9TRYfq6/V25w12dkw/uiW7lhqBSQE1o+hpw7a5sUGod6qd6zIbxRE0Nn//Yts7xI41qh8ksklURrbx5aWpwp28j0Q68ozVBzRZOehXsvJEqvDP2Eb3xa3lxgfnCZWDvsLbTVlz3uf1n1CqB12h95OKbilLDxpEbZ2AY8B6npJZQT9vy9YwQxsrf+zmDHNd5FAyVbhaZquC23ZEaTq62coHHgPa8GXsfZpUETmXflItTRU+kqyK7Ob9ETJfsrqMIsNYuTwJRNqs24n+E1WRBbK6RFXhx1SWqBq0lLdhd3smU5HnEqnBO5ltMh2dXFad++fFTkFBpO5AZhkXTAp2UgXbkfi/xtkEMPiAjePl8YWKmsmOMan6G4YvTBgoVTu058emIlk7PA4esvlKdIx2z5hPTX1jQuDFU/zsjUK9lS2jYtxLgo3MlsYWCMWMD0JPhP0sIvvgybCy48upTlbGSFZGNmI52po16N4hQwr+SSzPqjQdqbIaD1+uAvrGepYY+dWxFexNCYS3kZXLylRRacduJJhUcebJU6ac93mss+oby0mJioFLWD2ucMD7TKYju426dDYpMPg2eMcj9sX7xXImuq40PnVh1OS3KrpQxYesDEVt0Xb8bHd/2NiCgRETgoqI9vY2be66lDZizlCtrGasUW7nl9i9v0r/VzU4FxQM+Rey27y1Xp8oAhMGamtdJsF+suagUCfTex0PSy5dUSsklVwi6HXvjs3WrODbPjfxPb1vApMBKf70D2xtZAmEZ/PylGCL9jSunp5wkulIm9WHimdC5cCfy+yS3PMpHeWfS1QU/pIvK01FLiF7vjyj6Hb+tSwBYptEKroXbaz883Uq8G1LU9HxVJ5IDxpn9p0JkHb9YT3ZJFKDpvBliarI39CeHSf6s6IsHa3Hftg3PixD8de8+PLSyoH/x8ompiJvYxvSy2PO+HdsV5YuvJ/8JaujH2AbqsN2pdWDvmFVx7ctTUU+xHLer6ycrbCQyy5RFdlWlo6argWW1QT+A/0Q+DNoIhVZw9fnDQyMmAzcqrXNvN7azv3bBBtePHzQxfEivO3++hVaS+th3UfN5txrhPGBHMutJBtfLk2ZVaHbszsA3RzPezNuN/WLyYA0d/JQvb74mR8Kdbzo22TRkOulSQXtmbbUZhIzg8YVCBe347h7EqYPmSRgEmVpc2IwyiXtzR9G8/YGaI9tc9kkU1F9Lk3l3AV8tOd9qmDVNjkreB7WsUTNvimYyioHma5tYWBimrRkwMlWfcnKVCj56NyTsK0TkR8swy0OUMwmkTJfSzHGBD81CvUlBf8sK2dgG94Gy7C9uTz6ACtLpqJ7qCxeIZ9/9CUrYyQqI2uwLpmKvEf1eYWCCE9zS5OQEJzoptevMXzxyQTteN3w8hWGHR90cbwI+2ubPwY2WQQmDJSqHdrz48slmT2OH+Ftx1V+09QvJgPSrk3LctaTanesl9rNHv28Xj7mrz8T6uasPWj0T+MKhK3vsusJmD446chYrCfwQ8bKEpWRd8SyQZ9gWS4/JHYNRq9PDxqEdbyvMsndY4xEOtqE9ny9HWx9Mb5d6awLvkR16JOJBczSVOEyvmxK9eD/ojaJyoGnYxsaD7tAzpexmxTikLzIjx1lqegB7MNKycrIikQ6Usxfv0ikBus3ZUysNn8r1X1LfOSySVZFjV8k0Favr4y8Q/WllYWmwE3lyXTkUWxHwm+22L40PehWLNN9ct/CS6sHFbIybM+3+aim0JTAyc+EdORytOfr8w4GR0Zza7OQEJyIsHptpZXbM4HTSYD+z34jTiVb9lAnmyziuSnbhKTBiy3iSWCdTJMX7dNtFyzZKyQXmQh67Q/F1+L4Eb799AW/0PslMBmQ7Ort7Mrff1QvT7wmrsE2ojqzDw+DHxuOuyfBf3BK04NMd/LwmD9kmd/i8YM3qWKAKWjOmlXwL7n9ZDQhHTUSXVlq8BasZ5K1Z3u5ZNpkdx9FUTs7+Db8tzL0x/uVlbltx78urRj4Pd4Xgu2tNDltvjMrF8nKwaafRtn1Fv51onKAaQ8l9s0mkYpW8GXkC8eB9TIbq3IVJVORV2RtZT5LKgrPxDLSuFT0MlkdK8t1HZH6yTsYHBmYCJyIWLBxrlHG7lxjtLW3CfYohtPARrahb4zT1m4r0ieMwKSBUrVDe36MMv36vphut2vvEf5YhLt9EN7Hss3vGH1uXlElJAO7RIKysrMqZ/rb9Ozt0fzYcNw9CdUPDm83IVU4H8tQyfTA89AHA+2w30RVofF7u+GratAdrK50TuH3sV3pLPM3E1O7VKF0SSQZ6Fcvg29TJBZssQ3frrQquhbrmJIdiRXLTUoNSpIfK4Q2oEQ6uh7b2IE+eE2oHHRVWbqwiC+bWGVev600HWmy85OrP1bGX2txIrrNnC9LpCPlsr7Y6/HVA85AH1SH9hOrL7wAy1DULq+c2ndYXwogxB/id2p3vP9z7a4Pfqk9WHS79tiY32t/TTyu66HY74QEwevN8sz20AyssypHMZwGNt6ewSaMuG+seedMFD3jwsA6mQi+T5mIMy5wdiz+UNFGsq87tFy7o+Nb2LRh8q2l7RKGSUOuM2zr63ZpS2aPMV6ztdQE+ye/pz0/vsaw4Y8Px92TUP3g8HaJ6guDWGZSx1+RPMl04buCHQsWc6Om5y+wnsmqDv/qRJtEReR53rcV7PZd9JNIR/+B/ZGkAa7jeSEcE/rFdiYf6cIXuWHpJKsGns/qJsyNnkplY9Jn/Du1Ka2Mrk2moqYVwc0e1MCxoL9kunA+luV6XZYuNK2cQDay/hJVhY2llYO+wb3OmXjYs1Ayv7Iy9lAnlidTkZfRJ9lPqh5UiOX860RV5Dqrtnmld//Y9XyAbG7NXiDOBSYJlaRC/PCVK4U6tHMa2Hr3K7qVP47MpF1k9IlJA6Vqx8Se8WGwh0f5caIIp8cS4FZQaGk9pI2uyfyMNyrHrc4Elss05q/ZbSOII/V1gh3phfdHGXZOj+VYofrBkdnhB8/KR1lVdD/aWdljPXvuwaqO14SP+ukB2VRWFbnG5NwCvk3J3KDfbgtuWbuydCa5oa1tuw7JnshnW0BTPT5Jj8j6UaX8U5/pzkCZL+GZlDkDr0ZbbCcrYyTTzttydZ/Dn27Jr11ZLt9W9rzYz44yG2qbVwLBUY/wAfJA/UqtvOZqrXLpbdr81Y9oSza8qG3eXabf7kxggsCE8s5Hrwp1pPb2dqEM5Tawkf3//rRcq1z2O33SiNdm7hASB6/t+zOLW6ruk0Pw4+R13tcyP6exlayp7KQ+I8/BMcvo3b/4d9Smra3Rdmtppkxf7UJ5PvTyy88ax8v2H3L6vhwLVD84Mju+zOr6D344eSXTAyfZ2eeqM8Sto8aXl6YL7+HbyyhNF77Jt0mkIjcJ/kHUli8bOrTgX+1+EpK1K0sP1n+eRKzaWuHEFkmkBwnbi2fGln1uJsEepOXq+GVlUNQmmY7MkZanCrdim6zfCy5kNljO+xhfceEFWIZt2Gv8Cba06mv6qiXok39AWKiz6Ycvzyv+UHw4BRDG+h0lwoCYiB++8m0hQTAt25J9Ih3rnIrBB28csxV8GwaOHZMGStWOKb0hs8R/c0ubkGyY6PbjS64tc3wcgWD861k/bdlbmSXJgMQ4fLBWKM+H/vHXu425OTeqtlrCsUb1gyOzgzLTNbcJVRHTczsy8fZELhuss7NReY4FfdmptKrwmyptS1OFG7BM1q40Hf2pMZiCgoLhs876N2zHfkLjbWTI+lEF+5P5Ka26wLRBXyIVheeSMhpaU/ivfDuZP2yDNsl09GYsZ6I1z8bMubAXtkG/ycqo6Q5KKzu+XFYns0mkIy9Z1eUNfziW4oP0gjVPCoMifvz6/wjJgYm/nRnr3IjBB28csxWBYPF6/lho/O1HM9/Odh1qFhIHr50HMt9yDja2CXUyEfxY+f6xDsdrxUlnDf8S+mFgIjDUcV1m0ccjxbo86N1nM/voMPpfYr1baU9C9YMjs2PLlfDliXmRgWwBS/xcUBtZGcLX87fRMpLpiOlZIBUfWIegP174+z/6wzq0k5UxkpWF1/PliYrIlYlU5Pdoz2R18wXCt2HXkbA+F9inrlTUtP4d2uFrpkRq4K+xTWll4Taqn9jx8yi2M9pXRfUFYUuro9Oxjon3KyvH3W15Taga2F/WFv2yOyuFepvlirAuLwSC8SV8cPt40Q9Mgzp6tF0vX7NjhZAYMEnc+Jo8ITkVw02gZlCb8RM36uPfvneGESwZmDRQqnZMycWZmw1kC3oS9DoQjk/EseYC/TAwEZDiz/woZ31n9cFTPzbGEL0qu1o2jrknofrBsbLjy61kZcv7IezqE/Oy11ewjieZytzmi+UIjomUrBj4A1k937a0MlKM9byNVblel4In2yXi7e0wrTOXLvwA6/nnm7COodJ3orrwfqyn1+NmDDzLbJ3FeGo/FZVeA0Gf+FAo08hPzStT87dtl6YHLTPKJX7LqgavM7Xl6hLpwjRfR+CYZJTNLXyA2YyfPehbWNdpAqGYcUcUY2L1JaaDIjApdJVuej2zVTQfvHHMuZAFfYQli6bWTCIlqjZk9p7ZcTDzLefAEWfXcm57oMLot2z6Cr1sWGyVq2NgyI4BEwFp2+p5OevzIeKBJ6tdH1N3wp/D7O4drCd4O7Eucg1fTxqXKuyHtsmq6FyZDyIbbApnY11XgcvzJNKFv6M68/zItz5IpAp3Jqui65LpQtNK0XbLBpXV9DkN5yzTT+R2tFXBqi/0z9fxsDvF6NbtXJSlovdimRNwPBkVft1kkx5sJLdJ3NJIPImqaOYB1grzzSETqwf/iNqyVRj4OiKZju7ozv2aHOMPx2pNCafqImOyiJ++8V0hMXSV7njvar1PGpM/HNuOY7bCKtlgcsgFb4fJRaY7OPuVq+tMffPjwbHaQe2Wrcp+i8IkgMkAy60Uf/oGx22ICZM3uT6m7uT1KQWfVwlGjDL9W4N5AcbPMqVzIr/g52ZcZeG1aGPHBP124kgbWwkB6/JNWToirKeGwjbHAmHJn8rIEbQ54fGHY6bVlsuqvqZPVnlN5kFNBiYFVQ2f9ZZQZqcnxvxC75PGFAjFnsYxWyFLOJggeGTlbNvpBZsz2wmgzT1jsjuFsrvPajg7Gfx4nC52Se2eeD7zDEx93W4hCWAywHJeC6d/yI3MzJr55YI9iti9z/QQa4+GXxYmmY7UY/2JSk8M1nYkU4Ofw3EzJVKFPWqbDHanWWk6unISd23FgwODNL2RBCYEJ3Lj4+3pQ/Q2xrhCxfoyH/bc/q/Upq0tu92BVcLBcqxDu5U7s9suIw+MzzxY2tRi/pnuiu9PMiUdJ0Ga7C+6pkz3tXjWKCEJYDLA8qnvPmTUtbVmfipkbFszX68f85efGGWMXAt/8jg9lmNJaWrQ/+gJJxWpwboTFQzaWO/h0WXIEg57hoXAhKAqfo+b3w37qVBvpamLxpuCmj8ct10S49S+xafjcRh9S5JKQ5P8LjQr+MUrHxiX2ditZMFe/fVzU7fa+nCTdMi2z0Ulug9MALJkgOUrqydqtTvW6XUT37xLqCfx20mzm0Swnu+D4eQ4PHoeXsLxOGZgoOa/3dSsr9LXPmPcOvT/hORgpQeLbjN8EGhjpTkrJ+v2NKZA/2Lj4Tcr+GN47pXs7qIMTCpsDxwsy5UseH4PS+S8+clOwcfibQ3YTMfp8jZke07haL09JgBZMpCVswd2sdxK5m2pRV+Ek+Pw6HmYEk7H1ggeHt1CroTDs2XfJiE5WIlg14MItLHSoo2f6PY0JrtvOPz49+w1/+w1aWmdkBByibFwS720nIHldkJonCpL+5MtS1QMTACYDNrbxMRiVZ5LjDbJmmo8NLaTzozre3B4HD+UpQr78QknMXdgBG08PLoMWcKpWPobbe22EdrkuZdrBw9nfpIpqnhPSA4yEfvrV+q+aEmckXPeNWzYwqDYjrRh92JTUAsEYyNwzDxkF/1Owuj71Rm5l7FxoyMt8p/hcundyl3GmBhfPl/9Ww6+L5gAMBmsnjdFWm7XFsXYtLRCWk7QuE7rV9Q1W9B6dBllqcgw7+c0j2MGBjbT1+2qwVpD0w69HBODTOPnZq+f8D4IZjN54QT9/9v2bRbaMx08nLk2wiWcR3DMhD9cNIofO4GB/1iJfVviGfitCXlPOBNe/o1eX/7Bo0IdgeW5xIjBbqC8LwaNq1e/mP4QocfxQ1l1ZLGXcDyOGRjYMOEQfFJ4fcpf9DL2mz+V3fT37A6fuXwgmHAII6j1HSl9OIrhDxeZbulm7LZZvqYrtYW7PvR8+TZjTAS7AcBNwjmaY1HOmmkf6L6xnE8SWG6lZRWZGzawnPfFoHH5gzFjn3eP44PSdKTOSzgexwwnCefWodklTvhyPlFMqr5U8LFm63BTm4YjW0yvcyWcQLBE2IOEwLETmAhy6b3ULqHMrezgx4vHgpw+IHaUbOsP7BISAKl2Z6ZfLOeTBJZbqbXZelVq/oYCLuF0zZ7nHl1GWSqyy0s4HscMDNqYLKxoa8/sm8Mv3Llo3bNCe5kfKuODGJ9wWlvbucB8o7CfBhEIx2fJEg7jsbItpmQwZVmdVg+3Q78+c6dui4mDhHel8Spfsd/0+v5x2YdCZcxbuMc4pl79i2wfVmMPipL9wbotQgIgEVhOdZtXpIVyK+Valfpwc3Z7ChqXLxyvxHF79GySqehoL+F4HDMw4TCsEgVfN2fJzabydTuKhSTDq/5IZtOyI827TeVsvxfi4VhmEcqtOxq4hJMbsrv7jynDjxte+mibKYHUHm7Ry5dtPywkGyaCBWk+cVrBzzMeg4xAKN5C9ssWDRcSAInAcqob9+LNQrmV7HwRXMLZh+P26NmMSQdP4T9/WO/h0aXIEg6jZs3j+gk5sfpSfQM2TCBMxPJNfxfqZJpU/Q2hjGn11vdNfQ+4bLxycObHrxL4EXY3nSq44KcdjU3iXjn+/jHL1Wd5fMGilfz7MunD24UkkCtJLPpopNZ0+JAWf+oGoc5KMl/sBgLEOJZQ7lvWPXom/GeP7VOD9R4eXYpd0N5eO1NYRZppx76ZQpmdJlZdrFUuuxW70JEt849jFRn+b7x9MywvY0XtwSXalHlXGIuV8t+0GAca1ujlVsjmidi2M/sNjdcp5xWdgaO3Zuh/ULtf3TPb8N3ackSLP/39nEmC6eC+bVrTkQahPJdqd27UlqSKDJ8ynL03Hj0RtocK/5nEeg+PLsUfju3kA0nfi8dinMlJS2uDdrhxp1Z/ZLN2uHGH1tpmve6YFeyJegzQOE4rfOGit7DtgYOZa0w8O3cfxqK88/hfa4TjcHIsPOijRSGZHjlUp+3bsVrbvXWptmfbMm37hnnanh3LtIZDu9HUEUtX1JrGovLwqoeHh4cU/icc1IbNme2U8wFbZXnthgPaeYOzWxWjAqEiRysrM07rF/tf9GOnpStrtYaOazVu+OXdnwg+eX2xz9DTcJxOQZ9M/31hsbb/gJhQ8wF7f7Zsq9f+77aPhX554Tg9PDw8nPI5DCx2Cn59nPaN703Urrpxqvbdn5br/0a+kxDsVIUDckogmL27K9/qd/FY7cwLRwnlMhUUDHG0HW4u2MV59G8lNr6Lr0lq1/5kmvajWz7WfnbHLO2m22dq1/9yuvatH0zWLrwi+/CpGwWC8ZE4Pg8PD49O4QvGpmOw6QoFQsUtvuDI/G9lqh9D/FV/OP6pPxxL+UNFUV+fd88JhGIHcAz51Kl94sJukPnCF46/iP11h9iusDgWDw8PD6f8f3wlVxsOO53aAAAAAElFTkSuQmCC";

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  body { font-family: Arial, sans-serif; font-size: 11pt; margin: 2cm 2.5cm; color: #000; }
  table { border-collapse: collapse; width: 100%; }
  .header-logo { float: right; }
  .header-logo img { height: 55px; }
  h1 { text-align: center; font-size: 14pt; font-weight: bold; text-decoration: underline; margin: 10px 0 6px; letter-spacing: 1px; clear: both; }
  .subtitulo { font-size: 10pt; text-decoration: underline; margin-bottom: 14px; }
  .org-table { margin-bottom: 10px; }
  .org-table td { padding: 4px 10px 4px 0; font-weight: bold; font-size: 11pt; white-space: nowrap; }
  .org-box { display: inline-block; width: 14px; height: 14px; border: 1px solid #000; vertical-align: middle; margin-left: 8px; }
  .org-box-sel { display: inline-block; width: 14px; height: 14px; border: 1px solid #000; vertical-align: middle; margin-left: 8px; background: #000; }
  .gore-nota { font-size: 9.5pt; font-style: italic; margin: 6px 0 10px; }
  .seccion { font-weight: bold; font-size: 11pt; text-decoration: underline; margin: 16px 0 8px; }
  .nota { font-size: 9pt; font-style: normal; margin: 6px 0; }
  .sub-row td { padding-left: 32px !important; }
  .resultado { margin-top: 20px; border: 2px solid #000; padding: 12px 16px; text-align: center; font-weight: bold; font-size: 11pt; }
  .pie { margin-top: 32px; }
  .pie-campo { margin-bottom: 24px; }
  .pie-label { font-size: 9.5pt; color: #444; text-decoration: underline; margin-bottom: 20px; display: block; }
  .pie-valor { border-bottom: 1px solid #000; min-width: 240px; display: inline-block; padding-bottom: 2px; font-size: 11pt; min-height: 22px; }
</style>
</head><body>

<div class="header-logo">
  <img src="data:image/png;base64,${LOGO_B64}" alt="Municipalidad de Molina">
</div>

<h1>FICHA EVALUACION INICIATIVA</h1>
<div class="subtitulo">Se deberá evaluar cualquier iniciativa a proyecto de acuerdo con lo siguiente:</div>

<table class="org-table">
  <tr>
    <td>SUBDERE <span class="${ficha.tipo_organismo === 'SUBDERE' ? 'org-box-sel' : 'org-box'}"></span></td>
    <td style="padding-left:32px">GOBIERNO REGIONAL <span class="${ficha.tipo_organismo === 'GORE' ? 'org-box-sel' : 'org-box'}"></span></td>
    <td style="padding-left:32px">MUNICIPAL <span class="${ficha.tipo_organismo === 'Municipal' ? 'org-box-sel' : 'org-box'}"></span></td>
  </tr>
</table>

<div class="gore-nota">(Si la iniciativa es al Gobierno Regional responder lo siguiente)</div>

<table>
  ${filaSiNo("En el terreno a presentar proyecto se han llevado a cabo<br>Iniciativas dentro de los últimos 2 años", ficha.iniciativas_previas)}
</table>

${ficha.iniciativas_previas === true ? `<p class="nota">Si la respuesta anterior es <b>Si</b> se deberá evaluar la iniciativa y cumplir con las disposiciones de plazo para la presentación y esperar el plazo determinado. Si es <b>No</b> se puede continuar</p>` : ""}

<div class="seccion">- &nbsp; Legalidad del terreno:</div>

<table>
  ${filaSiNo("1.- Terreno cuenta con inscripción en CBR", ficha.cbr)}
  ${filaSiNo("2.- Terreno cuenta con Rol de avalúo vigente", ficha.rol_avaluo)}
  ${filaSiNo("3.- Terreno es de propiedad Municipal", ficha.propiedad_municipal)}
  ${ficha.propiedad_municipal === false ? `
  <tr class="sub-row">
    <td style="padding:6px 8px 6px 32px;vertical-align:top;width:75%">3.1 Si la respuesta es No el propietario está<br>dispuesto a efectuar comodato o usufructo?</td>
    <td style="padding:6px 0;white-space:nowrap;text-align:center;width:12%">Si ${chk(ficha.comodato === true)}</td>
    <td style="padding:6px 0;white-space:nowrap;text-align:center;width:13%">No ${chk(ficha.comodato === false)}</td>
  </tr>` : ""}
</table>

<p class="nota">Si cualquiera de las respuestas anteriores es <b>No</b>, se deberá evaluar la iniciativa y cumplir con las disposiciones anteriores para comenzar el diseño o la evaluación.</p>

<div class="seccion">- &nbsp; Cumplimiento de normas.</div>

<table>
  ${filaSiNo("1.- El proyecto deberá contar con permiso de edificación", ficha.permiso_edificacion)}
</table>

<p class="nota">Si la respuesta es <b>No</b> se pasa al punto 2.<br>Si la respuesta es <b>Si</b> se continua con lo siguiente:</p>

${ficha.permiso_edificacion === true ? `
<table>
  <tr>
    <td style="padding:6px 0 6px 24px;width:75%">- &nbsp; El terreno es: &nbsp;&nbsp;&nbsp; Urbano ${chk(ficha.tipo_terreno === "urbano")} &nbsp;&nbsp;&nbsp;&nbsp; Rural ${chk(ficha.tipo_terreno === "rural")}</td>
    <td></td><td></td>
  </tr>
  ${ficha.tipo_terreno === "rural" ? `
  <tr>
    <td style="padding:6px 0 6px 80px;text-align:center;width:75%">Si es Rural cuenta con IFC</td>
    <td style="padding:6px 0;white-space:nowrap;text-align:center;width:12%">Si ${chk(ficha.ifc === true)}</td>
    <td style="padding:6px 0;white-space:nowrap;text-align:center;width:13%">No ${chk(ficha.ifc === false)}</td>
  </tr>` : ""}
</table>
${ficha.tipo_terreno === "rural" && ficha.ifc === false ? `<p class="nota">Si no cuenta con IFC se debe tramitar antes de presentar la iniciativa.</p>` : ""}
${ficha.tipo_terreno === "urbano" ? `
<table>
  <tr>
    <td style="padding:6px 0 6px 24px;vertical-align:top;width:75%">- &nbsp; Si el terreno es urbano cumple con la zonificación<br>&nbsp;&nbsp;&nbsp;&nbsp;para el diseño</td>
    <td style="padding:6px 0;white-space:nowrap;text-align:center;width:12%">Si ${chk(ficha.zonificacion === true)}</td>
    <td style="padding:6px 0;white-space:nowrap;text-align:center;width:13%">No ${chk(ficha.zonificacion === false)}</td>
  </tr>
</table>` : ""}
` : ""}

<table>
  ${filaSiNo("2.- El proyecto se encuentra dentro de las iniciativas<br>de financiamiento y dentro del Pladeco", ficha.pladeco)}
</table>

<div class="resultado">
  <b>Si se llega a la ultima respuesta con un Si, la iniciativa es viable para estudio</b>
</div>

<div class="pie">
  <div class="pie-campo">
    <span class="pie-label">Proyecto / Iniciativa</span>
    <span class="pie-valor">${ficha.nombre_proyecto || ""}</span>
  </div>
  <div class="pie-campo">
    <span class="pie-label">Responsable</span>
    <span class="pie-valor">${ficha.responsable || ""}</span>
  </div>
  <div class="pie-campo">
    <span class="pie-label">Fecha</span>
    <span class="pie-valor">${ficha.fecha || ""}</span>
  </div>
</div>

</body></html>`;

  const blob = new Blob([html], { type: "application/msword;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = \`Ficha_Evaluacion_\${(ficha.nombre_proyecto || "Iniciativa").replace(/\\s+/g, "_")}.doc\`;
  a.click();
  URL.revokeObjectURL(url);
}


export default function FichaEvaluacion({ ficha: fichaExterna, onChange, nombreProyecto }) {
  const [fichaInterna, setFichaInterna] = useState({
    tipo_organismo: "",
    iniciativas_previas: null,
    cbr: null,
    rol_avaluo: null,
    propiedad_municipal: null,
    comodato: null,
    permiso_edificacion: null,
    tipo_terreno: "",
    ifc: null,
    zonificacion: null,
    pladeco: null,
    nombre_proyecto: nombreProyecto || "",
    responsable: "",
    fecha: new Date().toLocaleDateString("es-CL"),
  });

  const f = fichaExterna || fichaInterna;
  const setF = onChange || ((fn) => setFichaInterna((prev) => fn(prev)));
  const set = (k, v) => setF((prev) => ({ ...prev, [k]: v }));

  const viable = calcularViabilidad(f);

  return (
    <div className="space-y-4">
      {/* Encabezado fiel al documento */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">

        {/* Header con logo */}
        <div className="bg-white px-5 py-3 flex items-center justify-between border-b border-gray-200">
          <img
            src="/logo-molina.png"
            alt="Municipalidad de Molina"
            className="h-10 object-contain"
            onError={(e) => { e.target.style.display = "none"; }}
          />
          <div className="text-right">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Ficha Evaluación Iniciativa</p>
            <p className="text-xs text-gray-400">SECPLAN — Municipalidad de Molina</p>
          </div>
        </div>

        <div className="bg-gray-50 px-5 py-3 border-b border-gray-100">
          <p className="text-xs text-gray-500 italic text-center mb-3">
            Se deberá evaluar cualquier iniciativa a proyecto de acuerdo con lo siguiente:
          </p>

          {/* Selector de organismo — opciones clicables */}
          <div className="flex justify-center gap-3">
            {[
              { key: "SUBDERE", label: "SUBDERE" },
              { key: "GORE", label: "Gobierno Regional" },
              { key: "Municipal", label: "Municipal" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => set("tipo_organismo", key)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold border-2 transition-all ${
                  f.tipo_organismo === key
                    ? "bg-slate-900 border-slate-900 text-white"
                    : "border-gray-300 text-gray-600 hover:border-slate-500"
                }`}>
                {label}
              </button>
            ))}
          </div>
          {!f.tipo_organismo && (
            <p className="text-xs text-amber-600 text-center mt-2">Selecciona el tipo de organismo al que se postula</p>
          )}
        </div>

        <div className="px-5 py-4 bg-white space-y-5">

          {/* Sección GORE: iniciativas previas — solo si es Gobierno Regional */}
          {f.tipo_organismo === "GORE" && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
              <p className="text-xs text-blue-700 italic">
                (Si la iniciativa es al Gobierno Regional responder lo siguiente)
              </p>
              <RadioDoc
                label="En el terreno a presentar proyecto se han llevado a cabo iniciativas dentro de los últimos 2 años"
                value={f.iniciativas_previas}
                onChange={(v) => set("iniciativas_previas", v)}
              />
              {f.iniciativas_previas === true && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
                  Se deberá evaluar la iniciativa y cumplir con las disposiciones de plazo para la presentación y esperar el plazo determinado. Si es No se puede continuar.
                </div>
              )}
            </div>
          )}

          {/* Legalidad del terreno */}
          <div>
            <p className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 bg-slate-800 text-white rounded-full text-xs flex items-center justify-center flex-shrink-0">●</span>
              Legalidad del terreno
            </p>
            <div className="space-y-3 pl-7">
              <RadioDoc label="1.- Terreno cuenta con inscripción en CBR" value={f.cbr} onChange={(v) => set("cbr", v)} />
              <RadioDoc label="2.- Terreno cuenta con Rol de avalúo vigente" value={f.rol_avaluo} onChange={(v) => set("rol_avaluo", v)} />
              <RadioDoc label="3.- Terreno es de propiedad Municipal" value={f.propiedad_municipal} onChange={(v) => set("propiedad_municipal", v)} />
              {f.propiedad_municipal === false && (
                <div className="ml-4 pl-3 border-l-2 border-gray-300">
                  <RadioDoc
                    label="3.1 Si la respuesta es No, ¿el propietario está dispuesto a efectuar comodato o usufructo?"
                    value={f.comodato}
                    onChange={(v) => set("comodato", v)}
                  />
                </div>
              )}
              <p className="text-xs text-gray-500 italic">
                Si cualquiera de las respuestas anteriores es No, se deberá evaluar la iniciativa y cumplir con las disposiciones anteriores para comenzar el diseño o la evaluación.
              </p>
            </div>
          </div>

          {/* Cumplimiento de normas */}
          <div>
            <p className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 bg-slate-800 text-white rounded-full text-xs flex items-center justify-center flex-shrink-0">●</span>
              Cumplimiento de normas
            </p>
            <div className="space-y-3 pl-7">
              <RadioDoc
                label="1.- El proyecto deberá contar con permiso de edificación"
                value={f.permiso_edificacion}
                onChange={(v) => set("permiso_edificacion", v)}
              />
              {f.permiso_edificacion === false && (
                <p className="text-xs text-gray-500 italic ml-2">Si la respuesta es No se pasa al punto 2.</p>
              )}
              {f.permiso_edificacion === true && (
                <div className="ml-4 pl-3 border-l-2 border-gray-300 space-y-3">
                  <div>
                    <p className="text-sm text-gray-700 mb-2">El terreno es:</p>
                    <div className="flex gap-3">
                      {["Urbano", "Rural"].map((t) => (
                        <button key={t} onClick={() => set("tipo_terreno", t.toLowerCase())}
                          className={`px-5 py-1.5 rounded-lg text-sm font-medium border-2 transition-all ${
                            f.tipo_terreno === t.toLowerCase()
                              ? "bg-amber-400 border-amber-400 text-white"
                              : "border-gray-200 text-gray-600 hover:border-amber-300"
                          }`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  {f.tipo_terreno === "rural" && (
                    <>
                      <RadioDoc label="¿El terreno cuenta con IFC?" value={f.ifc} onChange={(v) => set("ifc", v)} />
                      {f.ifc === false && (
                        <p className="text-xs text-gray-500 italic">Si no cuenta con IFC se debe tramitar antes de presentar la iniciativa.</p>
                      )}
                    </>
                  )}
                  {f.tipo_terreno === "urbano" && (
                    <RadioDoc
                      label="¿El terreno cumple con la zonificación para el diseño?"
                      value={f.zonificacion}
                      onChange={(v) => set("zonificacion", v)}
                    />
                  )}
                </div>
              )}
              <RadioDoc
                label="2.- El proyecto se encuentra dentro de las iniciativas de financiamiento y dentro del Pladeco"
                value={f.pladeco}
                onChange={(v) => set("pladeco", v)}
              />
            </div>
          </div>

          {/* Resultado viabilidad */}
          {viable === true && (
            <div className="bg-green-50 border-2 border-green-400 rounded-xl p-4 text-center">
              <p className="text-sm font-bold text-green-800">✅ Si se llega a la última respuesta con un Sí, la iniciativa es viable para estudio.</p>
            </div>
          )}
          {viable === false && (
            <div className="bg-red-50 border-2 border-red-400 rounded-xl p-4 text-center">
              <p className="text-sm font-bold text-red-800">❌ La iniciativa no cumple los requisitos actuales para continuar.</p>
            </div>
          )}
          {viable === null && f.pladeco === null && (f.tipo_organismo || f.cbr !== null) && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 italic">Si se llega a la última respuesta con un Sí, la iniciativa es viable para estudio.</p>
            </div>
          )}

          {/* Datos del pie de página */}
          <div className="border-t border-gray-200 pt-4 grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Proyecto / Iniciativa</label>
              <input className="input text-sm" value={f.nombre_proyecto || ""} onChange={(e) => set("nombre_proyecto", e.target.value)} placeholder="Nombre..." />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Responsable</label>
              <input className="input text-sm" value={f.responsable || ""} onChange={(e) => set("responsable", e.target.value)} placeholder="Nombre..." />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Fecha</label>
              <input className="input text-sm" value={f.fecha || ""} onChange={(e) => set("fecha", e.target.value)} placeholder="dd/mm/aaaa" />
            </div>
          </div>
        </div>
      </div>

      {/* Botón descarga Word */}
      <button
        onClick={() => descargarWord(f)}
        className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
        ⬇ Descargar ficha como Word (.doc)
      </button>
    </div>
  );
}

function RadioDoc({ label, value, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4 py-0.5">
      <p className="text-sm text-gray-800 flex-1 leading-snug">{label}</p>
      <div className="flex gap-2 flex-shrink-0">
        {[["Sí", true], ["No", false]].map(([l, v]) => (
          <button key={l} onClick={() => onChange(v)}
            className={`w-12 py-1 rounded-lg text-sm font-medium border transition-all ${
              value === v
                ? v ? "bg-green-500 border-green-500 text-white" : "bg-red-500 border-red-500 text-white"
                : "border-gray-300 text-gray-500 hover:border-gray-500"
            }`}>
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}