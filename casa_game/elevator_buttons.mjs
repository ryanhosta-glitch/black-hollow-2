/** Stable Forge labels, also applied to older CASA contracts by the Game. */
export function assignElevatorButtons(access){
 if(access.hub)access.hub.buttonLabel='G';
 const publicStops=access.stops.filter(s=>!s.requiresUnlock),primary=publicStops.filter(s=>s.role!=='disconnected-area'),extra=publicStops.filter(s=>s.role==='disconnected-area');
 let number=1,basement=0;
 for(const stop of [...primary,...extra]){
  if(/basement|crypt|cellar/i.test(stop.label||'')){stop.buttonLabel=++basement===1?'B':'B'+basement;continue;}
  if(number===13)number++;
  stop.buttonLabel=String(number++);
 }
 for(const stop of access.stops.filter(s=>s.requiresUnlock))stop.buttonLabel='13';
 if(access.hiddenDestination)access.hiddenDestination.buttonLabel='13';
 return access;
}
