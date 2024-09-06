const express = require('express');
const router = express.Router();
const Staking = require('../Model/StakingSchema');
const Users = require('../Model/model');
const Plan = require('../Model/PlanDetails');

const userController = require('../Controller/Controller');
router.post('/users', userController.users);    


// Route to create a new plan
router.post('/plans', async (req, res) => { 
  const { planName, duration, minimumAmount, rewardPercentage } = req.body;

  try {
    const plan = new Plan({
      planName, 
      duration,
      minimumAmount,
      rewardPercentage
    });

    await plan.save();
    console.log('Plan created successfully:', plan);
    res.status(200).json({ message: 'Plan created successfully', plan });
  } catch (error) {
    console.error('Error creating plan:', error);
    res.status(500).json({ message: 'Error creating plan', error });
  }
});

// Route to get all plans
router.get('/plans', async (req, res) => {
  try {
    const plans = await Plan.find();
    res.status(200).json(plans);
  } catch (error) {
    console.error('Error retrieving plans:', error);
    res.status(500).json({ message: 'Error retrieving plans', error });
  }
});

// Route to delete a plan
router.delete('/plans/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await Plan.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    console.log('Plan deleted successfully:', result);
    res.status(200).json({ message: 'Plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting plan:', error);
    res.status(500).json({ message: 'Error deleting plan', error });
  }
});

// Route to create a staking entry
router.post('/stake', async (req, res) => {
  const { planid, amount, userid } = req.body;

  try {
    const user = await Users.findById(userid);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const plan = await Plan.findById(planid); // Ensure the field matches
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    if (amount < plan.minimumAmount) {
      return res.status(400).json({ message: `Minimum staking amount for this plan is ${plan.minimumAmount}` });
    }

    const staking = new Staking({
      userId: userid,
      planId: plan._id,
      amountStaked: amount,
    });

    await staking.save();
    console.log('Staking saved successfully:', staking);
    res.status(200).json({ message: 'Staking successful', staking });
  } catch (error) {
    console.error('Error during staking:', error);
    res.status(500).json({ message: 'Error staking funds', error });
  }
});

// Route to get staking details for a user
router.get('/stake/:userid', async (req, res) => {
  const { userid } = req.params;

  try {
    const user = await Users.findById(userid);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const stakedData = await Staking.find({ userId: userid }).populate('planId');
    if (!stakedData.length) {
      return res.status(404).json({ message: 'No staking data found for this user' });
    }

    const stakingDetails = stakedData.map(staking => {
      const planDetail = staking.planId;
      const endDate = new Date(); // Use a default end date or compute based on your needs
      const rewardsEarned = (staking.amountStaked * planDetail.rewardPercentage) / 100;

      return {
        amountStaked: staking.amountStaked,
        startDate: staking.createdAt,
        endDate: endDate,
        rewardsEarned: rewardsEarned,
        isUnstaked: staking.isUnstaked,
        planName: planDetail.planName
      };
    });

    res.status(200).json({
      message: 'Staking details retrieved successfully',
      stakingDetails
    });
  } catch (error) {
    console.error('Error retrieving staking data:', error);
    res.status(500).json({ message: 'Error retrieving staking data', error });
  }
});

// Route to update a staking entry
router.put('/stake/:stakeid', async (req, res) => {
  const { stakeid } = req.params;
  const { amount, isUnstaked } = req.body;
  console.log('stakeid', stakeid)

  try {
    const staking = await Staking.findById(stakeid);
    if (!staking) {
      return res.status(404).json({ message: 'Staking entry not found' });
    }

    // Update staking entry fieldsJJ
    if (amount) staking.amountStaked = amount;
    if (isUnstaked !== undefined) staking.isUnstaked = isUnstaked;

    await staking.save();
    console.log('Staking entry updated successfully:', staking);
    res.status(200).json({ message: 'Staking entry updated successfully', staking });
  } catch (error) {
    console.error('Error updating staking entry:', error);
    res.status(500).json({ message: 'Error updating staking entry', error });
  }
});

module.exports = router;
