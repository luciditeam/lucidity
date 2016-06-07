import { BlockType } from '../../Block'
import { describe } from '../../Test/runner'
import { SceneHelper } from './SceneHelper'
import { GraphHelper } from '../../Graph'

describe ( 'SceneHelper.create', ( it ) => {

    it ( 'should return block and scene docs', ( assert ) => {
        const scene = SceneHelper.create ()
        const graph = GraphHelper.create ()

        assert.equal
        ( scene
        , { _id: scene._id ? scene._id : 'bad'
          , type: 'scene'
          , graph
          }
        )

      }
    )

  }
)
