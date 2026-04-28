# Central de Operações Final

Interface moderna integrada com:

- Gerador de Relatórios
- Gerador de Escalas

## Como rodar

No PowerShell, dentro da pasta do projeto:

```powershell
npm install
npm start
```

Depois abra:

```text
http://localhost:3000
```

## Rotas

```text
http://localhost:3000/
http://localhost:3000/relatorios/
http://localhost:3000/escalas/
```

## Salvamento da escala

As informações do Gerador de Escalas ficam em:

```text
apps/escalas/data/state.json
```


## Atualização v14

- Corrigida a validação de cobertura dos horários técnicos.
- Agora Supervisor ou Controlador com jornada maior também cobre o horário técnico.
  Exemplo: Supervisor em 06:00–14:20 cobre o horário técnico 06:00–12:00.
- A validação não exige mais que o horário seja exatamente igual; ela verifica se o intervalo cobre o turno solicitado.


## Atualização v16

- Gerador de Relatórios substituído pela versão otimizada enviada.
- Adicionado Edinho Maia na lista de equipe técnica.
- Removida a linha extra de informação adicional quando não houver conteúdo preenchido.
- Mantido o Gerador de Escalas com as correções mais recentes.


## Atualização v17

- Removida a linha extra vazia de Técnico de Sistemas Audio Visual.
- Adicionado colaborador Eletricista: Edinho Maia.
- Horário padrão do Eletricista ajustado para 08:00–16:00.

## Onde alterar futuramente

- Colaboradores: `apps/escalas/app.js`, em `DEFAULT_STATE.employees`.
- Horários padrão: `apps/escalas/app.js`, em `DEFAULT_STATE.shifts`.
- Cargos disponíveis: `apps/escalas/app.js`, em `ROLES`.


## Atualização v18

- Horário padrão do Eletricista alterado para 08:00–16:20.
- O arquivo `apps/escalas/data/state.json` foi atualizado para refletir o novo horário.
- A chave do armazenamento local foi alterada para evitar carregar horários antigos do navegador.


## Atualização v19

- Horário do Eletricista 08:00–16:20 agora usa a cor #d395a6.
- Adicionada cor fixa para horários iniciados em 08:00.
- Chave de armazenamento local atualizada para evitar cache antigo do navegador.
