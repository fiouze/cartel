import React from 'react'
import { Check, Users, X } from 'lucide-react'

export default function QuotaPage({ members, quotas, canEdit, onSet }) {
  const respected = members.filter(member => quotas[String(member.id)] === true).length

  return <>
    <div className="section-toolbar">
      <div className="toolbar-note">{canEdit ? "Coche le vert si le quota est respecté, ou la croix rouge s’il ne l’est pas." : "Consultation des quotas · changements réservés au haut commandement."}</div>
      <span className="quota-summary"><b>{respected}</b> / {members.length} respecté(s)</span>
    </div>
    <section className="quota-list">
      {members.length ? members.map((member, index) => {
        const status = quotas[String(member.id)]
        const stateClass = status === true ? 'quota-ok' : status === false ? 'quota-no' : ''
        const labelClass = status === true ? 'is-ok' : status === false ? 'is-no' : ''
        return <article key={member.id} className={'quota-row ' + stateClass}>
          <span className={'avatar avatar-' + (index % 5)}>{member.name.slice(0, 1).toUpperCase()}</span>
          <span className="quota-member"><b>{member.name}</b><small>{member.rank?.replace(/^.*・/, '') || 'Membre'}</small></span>
          <span className={'quota-status ' + labelClass}>{status === true ? 'Quota respecté' : status === false ? 'Quota non respecté' : 'À vérifier'}</span>
          {canEdit ? <div className="quota-actions">
            <button type="button" className={'quota-button quota-yes ' + (status === true ? 'selected' : '')} onClick={() => onSet(member, true)} aria-label={'Marquer le quota de ' + member.name + ' comme respecté'} title="Quota respecté"><Check size={17} /></button>
            <button type="button" className={'quota-button quota-no-button ' + (status === false ? 'selected' : '')} onClick={() => onSet(member, false)} aria-label={'Marquer le quota de ' + member.name + ' comme non respecté'} title="Quota non respecté"><X size={17} /></button>
          </div> : <span className="quota-readonly">Lecture seule</span>}
        </article>
      }) : <div className="panel empty-state"><Users /><h3>Aucun membre à afficher</h3><p>Les membres inscrits apparaîtront automatiquement ici.</p></div>}
    </section>
  </>
}
