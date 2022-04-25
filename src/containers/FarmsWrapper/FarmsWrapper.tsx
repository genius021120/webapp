import React, { useEffect } from 'react'
import FarmList from '@components/FarmsList/FarmList'
import { status } from '@selectors/solanaWallet'
import { Grid } from '@material-ui/core'
import { Status, actions as walletActions } from '@reducers/solanaWallet'
import { useSelector, useDispatch } from 'react-redux'
import { farmsWithUserStakedValues } from '@selectors/farms'
import { pools, tokens } from '@selectors/pools'
import { actions } from '@reducers/farms'

export const FarmsWrapper: React.FC = () => {
  const dispatch = useDispatch()
  const walletStatus = useSelector(status)
  const allFarms = useSelector(farmsWithUserStakedValues)
  const allPools = useSelector(pools)
  const allTokens = useSelector(tokens)

  useEffect(() => {
    if (Object.values(allTokens).length > 0 && Object.values(allFarms).length === 0) {
      dispatch(actions.getFarms())
    }
  }, [allTokens])

  return (
    <Grid
      style={{
        justifyContent: 'center',
        display: 'flex',
        paddingInline: 20
      }}>
      <FarmList
        noConnectedBlockerProps={{
          onConnect: type => {
            dispatch(walletActions.connect(type))
          },
          onDisconnect: () => {
            dispatch(walletActions.disconnect())
          },
          descCustomText: 'You have no farms.'
        }}
        showNoConnected={walletStatus !== Status.Initialized}
        title={'Active farms'}
        data={
          Object.values(allFarms).map((farm) => {
            const now = Date.now()
            return {
              apyPercent: 0,
              totalStaked: (farm.totalStakedX ?? 0) + (farm.totalStakedY ?? 0),
              yourStaked: (farm.userStakedX ?? 0) + (farm.userStakedY ?? 0),
              tokenX: allTokens[allPools[farm.pool.toString()].tokenX.toString()],
              tokenY: allTokens[allPools[farm.pool.toString()].tokenY.toString()],
              farmId: farm.address.toString(),
              rewardSymbol: allTokens[farm.rewardToken.toString()].symbol,
              rewardIcon: allTokens[farm.rewardToken.toString()].logoURI,
              isActive: now <= farm.endTime.v.toNumber()
            }
          })
        }
      />
    </Grid>
  )
}
